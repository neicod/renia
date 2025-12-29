// @env: mixed
import React from 'react';
import type { CartItem } from 'renia-module-cart';
import { useCart } from 'renia-module-cart';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useCartManager } from '../context/CartManagerContext';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { getCartItemRemoteId } from 'renia-magento-cart/utils/cartItemRemoteId';

const formatPrice = (valueCents: number, currency?: string) => {
  const value = Number.isFinite(valueCents) ? valueCents / 100 : 0;
  return `${value.toFixed(2)} ${currency ?? 'USD'}`;
};

export const CartPage: React.FC = () => {
  const cart = useCart();
  const manager = useCartManager();
  const toast = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = React.useState(false);
  const [updatingItemId, setUpdatingItemId] = React.useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = React.useState<string | null>(null);
  const [pendingQty, setPendingQty] = React.useState<Record<string, number>>({});
  const [lastRemoved, setLastRemoved] = React.useState<{
    sku?: string;
    qty: number;
    name: string;
  } | null>(null);
  const undoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [undoing, setUndoing] = React.useState(false);

  const totalCents = cart.items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
  const currency = cart.items[0]?.currency ?? 'USD';

  const refreshCart = React.useCallback(async () => {
    setLoading(true);
    try {
      await manager.refreshCart();
    } catch (error) {
      console.error('[CartPage] Nie udało się odświeżyć koszyka', error);
      toast({
        tone: 'error',
        title: t('cart.error.refresh')
      });
    } finally {
      setLoading(false);
    }
  }, [toast, manager]);

  React.useEffect(() => {
    refreshCart();
    return () => {
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
    };
  }, [refreshCart]);

  const getQtyValue = React.useCallback(
    (item: CartItem) => pendingQty[item.id] ?? item.qty,
    [pendingQty]
  );

  const setQtyValue = (item: CartItem, qty: number) => {
    setPendingQty((prev) => ({
      ...prev,
      [item.id]: qty
    }));
  };

  const clearQtyValue = (itemId: string) => {
    setPendingQty((prev) => {
      if (!(itemId in prev)) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleUpdateQuantity = async (item: CartItem) => {
    const quantity = Math.max(1, getQtyValue(item));
    const remoteId = getCartItemRemoteId(item);
    if (!remoteId) {
      toast({
        tone: 'error',
        title: t('cart.error.noRemoteId'),
        description: t('cart.error.updateQty')
      });
      return;
    }
    setUpdatingItemId(item.id);
    try {
      await manager.updateItemQuantity({ cartItemId: remoteId, quantity });
      toast({
        tone: 'success',
        title: t('cart.success.qtyUpdated'),
        description: item.name
      });
      clearQtyValue(item.id);
    } catch (error) {
      console.error('[CartPage] update qty error', error);
      toast({
        tone: 'error',
        title: t('cart.error.updateQty'),
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    const remoteId = getCartItemRemoteId(item);
    if (!remoteId) {
      toast({
        tone: 'error',
        title: t('cart.error.noRemoteId'),
        description: t('cart.error.removeItem')
      });
      return;
    }
    setRemovingItemId(item.id);
    try {
      await manager.removeItem({ cartItemId: remoteId });
      toast({
        tone: 'info',
        title: t('cart.info.removed'),
        description: item.name
      });
      clearQtyValue(item.id);
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
      if (item.sku) {
        setLastRemoved({ sku: item.sku, qty: item.qty, name: item.name });
        undoTimer.current = setTimeout(() => {
          setLastRemoved(null);
          undoTimer.current = null;
        }, 8000);
      } else {
        setLastRemoved(null);
      }
    } catch (error) {
      console.error('[CartPage] remove item error', error);
      toast({
        tone: 'error',
        title: 'Nie udało się usunąć produktu',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleUndoRemove = async () => {
    if (!lastRemoved?.sku) return;
    setUndoing(true);
    try {
      await manager.addProduct({
        sku: lastRemoved.sku,
        quantity: Math.max(1, lastRemoved.qty)
      });
      setLastRemoved(null);
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
        undoTimer.current = null;
      }
        toast({
          tone: 'success',
          title: t('cart.success.restored'),
          description: lastRemoved.name
        });
    } catch (error) {
      console.error('[CartPage] undo remove error', error);
      toast({
        tone: 'error',
        title: t('cart.error.restore'),
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setUndoing(false);
    }
  };

  const handleQtyButton = (item: CartItem, delta: number) => {
    const next = Math.max(1, getQtyValue(item) + delta);
    setQtyValue(item, next);
  };

  return (
    <section className="card" style={{ display: 'grid', gap: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('cart.title')}</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
            {cart.items.length
              ? t('cart.summary', { count: cart.items.length, total: formatPrice(totalCents, currency) })
              : t('cart.empty')}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshCart}
          disabled={loading}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '999px',
            border: '1px solid #d1d5db',
            background: loading ? '#f3f4f6' : '#fff',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? t('cart.refresh.loading') : t('cart.refresh.action')}
        </button>
      </header>

      {loading && !cart.items.length ? (
        <p style={{ color: '#6b7280' }}>{t('cart.loading')}</p>
      ) : null}

      {lastRemoved ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: '1px solid #bfdbfe',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <span>
            Usunięto {lastRemoved.qty} × {lastRemoved.name}
          </span>
          <button
            type="button"
            onClick={handleUndoRemove}
            disabled={undoing}
            style={{
              marginLeft: 'auto',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              cursor: undoing ? 'not-allowed' : 'pointer'
            }}
          >
            {undoing ? 'Przywracanie...' : 'Cofnij'}
          </button>
        </div>
      ) : null}

      {cart.items.length ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cart.items.map((item) => {
            const qty = getQtyValue(item);
            const updating = updatingItemId === item.id;
            const removing = removingItemId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.9rem 1rem',
                  display: 'grid',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      SKU: {item.sku ?? 'brak'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {formatPrice(item.priceCents * item.qty, item.currency ?? currency)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      border: '1px solid #cbd5f5',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      alignItems: 'center'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleQtyButton(item, -1)}
                      disabled={updating || removing || qty <= 1}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '0.3rem 0.75rem',
                        cursor: updating || removing || qty <= 1 ? 'not-allowed' : 'pointer'
                      }}
                      aria-label="Zmniejsz ilość"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(event) =>
                        setQtyValue(item, Math.max(1, Number(event.target.value) || 1))
                      }
                      style={{
                        width: '70px',
                        border: 'none',
                        textAlign: 'center',
                        padding: '0.3rem 0.4rem',
                        outline: 'none',
                        background: 'transparent'
                      }}
                      disabled={updating || removing}
                      aria-label="Ilość"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyButton(item, 1)}
                      disabled={updating || removing}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '0.3rem 0.75rem',
                        cursor: updating || removing ? 'not-allowed' : 'pointer'
                      }}
                      aria-label="Zwiększ ilość"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item)}
                    disabled={updating || removing}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '999px',
                      border: '1px solid #d1d5db',
                      background: updating ? '#e5e7eb' : '#fff',
                      fontWeight: 600,
                      cursor: updating || removing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updating ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item)}
                    disabled={updating || removing}
                    style={{
                      marginLeft: 'auto',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '999px',
                      border: '1px solid #fee2e2',
                      background: '#fff5f5',
                      color: '#b91c1c',
                      fontWeight: 600,
                      cursor: updating || removing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {removing ? 'Usuwanie...' : 'Usuń'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {cart.items.length ? (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 700
          }}
        >
          <span>Razem</span>
          <span>{formatPrice(totalCents, currency)}</span>
        </div>
      ) : null}
    </section>
  );
};

export default CartPage;
