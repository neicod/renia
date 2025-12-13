// @env: mixed
import React from 'react';
import { useCart, type CartItem } from 'renia-module-cart';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useCartManager } from 'renia-magento-cart/context/CartManagerContext';
import {
  cartSidebarStore,
  closeCartSidebar
} from '../services/cartSidebarStore';
import { getCartItemRemoteId } from 'renia-magento-cart/utils/cartItemRemoteId';

const useSidebarState = () =>
  React.useSyncExternalStore(
    cartSidebarStore.subscribe,
    cartSidebarStore.getState,
    cartSidebarStore.getState
  );

const formatPrice = (valueCents: number, currency?: string) => {
  const value = Number.isFinite(valueCents) ? valueCents / 100 : 0;
  return `${value.toFixed(2)} ${currency ?? 'USD'}`;
};

type SidebarItemProps = {
  item: CartItem;
  currency?: string;
  updating: boolean;
  removing: boolean;
  onUpdateQuantity: (qty: number) => Promise<void>;
  onRemove: () => Promise<void>;
};

const CartSidebarItem: React.FC<SidebarItemProps> = ({
  item,
  currency,
  updating,
  removing,
  onUpdateQuantity,
  onRemove
}) => {
  const [qty, setQty] = React.useState(item.qty);
  const isFirstRender = React.useRef(true);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setQty(item.qty);
  }, [item.qty]);

  // Debounce zapisu ilości – 1s po ostatniej zmianie
  // Debounce zapisu ilości – 1s po ostatniej lokalnej zmianie
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void onUpdateQuantity(qty);
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [qty]); // celowo bez onUpdateQuantity, oczekujemy stabilnego callbacku

  const handleIncrement = React.useCallback(
    (delta: number) => {
      const next = Math.max(1, qty + delta);
      setQty(next);
    },
    [qty, onUpdateQuantity]
  );

  const disabled = updating || removing;

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '0.85rem',
        display: 'grid',
        gap: '0.75rem'
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{item.name}</div>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>SKU: {item.sku ?? 'brak'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            onClick={() => handleIncrement(-1)}
            disabled={disabled || qty <= 1}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0.3rem 0.65rem',
              cursor: disabled || qty <= 1 ? 'not-allowed' : 'pointer'
            }}
            aria-label="Zmniejsz ilość"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
            style={{
              width: '60px',
              border: 'none',
              textAlign: 'center',
              padding: '0.3rem 0.2rem',
              outline: 'none',
              background: 'transparent'
            }}
            disabled={disabled}
            aria-label="Ilość"
          />
          <button
            type="button"
            onClick={() => handleIncrement(1)}
            disabled={disabled}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0.3rem 0.65rem',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            aria-label="Zwiększ ilość"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          style={{
            marginLeft: 'auto',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            border: '1px solid #fee2e2',
            color: '#b91c1c',
            background: '#fff5f5',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {removing ? 'Usuwanie...' : 'Usuń'}
        </button>
      </div>
      <div style={{ fontWeight: 600 }}>
        {formatPrice(item.priceCents * item.qty, item.currency ?? currency)}
      </div>
    </div>
  );
};

export const CartSidebar: React.FC = () => {
  const { isOpen } = useSidebarState();
  const cart = useCart();
  const toast = useToast();
  const manager = useCartManager();
  const [updatingItemId, setUpdatingItemId] = React.useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = React.useState<string | null>(null);

  const totalCents = cart.items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
  const currency = cart.items[0]?.currency ?? 'USD';

  const handleUpdateQuantity = React.useCallback(
    async (item: CartItem, quantity: number) => {
      const remoteId = getCartItemRemoteId(item);
      if (!remoteId) {
        toast({
          tone: 'error',
          title: 'Brak identyfikatora pozycji',
          description: 'Nie udało się zaktualizować ilości.'
        });
        return;
      }
      setUpdatingItemId(item.id);
      try {
        await manager.updateItemQuantity({ cartItemId: remoteId, quantity });
      } catch (error) {
        console.error('[CartSidebar] update qty error', error);
        toast({
          tone: 'error',
          title: 'Nie udało się zmienić ilości',
          description: error instanceof Error ? error.message : undefined
        });
      } finally {
        setUpdatingItemId(null);
      }
    },
    [toast, manager]
  );

  // stabilny callback per item.id aby debounce nie odpalał się wielokrotnie przy zmianie referencji
  const handleUpdateQuantityForItem = React.useRef(
    new Map<string | number, (qty: number) => Promise<void>>()
  );

  // sprzątanie usuniętych pozycji, zachowanie referencji istniejących
  React.useEffect(() => {
    const alive = new Set(cart.items.map((it) => it.id));
    for (const key of handleUpdateQuantityForItem.current.keys()) {
      if (!alive.has(key)) {
        handleUpdateQuantityForItem.current.delete(key);
      }
    }
  }, [cart.items]);

  const getUpdateHandler = React.useCallback(
    (item: CartItem) => {
      const cached = handleUpdateQuantityForItem.current.get(item.id);
      if (cached) return cached;
      const fn = (qty: number) => handleUpdateQuantity(item, qty);
      handleUpdateQuantityForItem.current.set(item.id, fn);
      return fn;
    },
    [handleUpdateQuantity]
  );

  const handleRemoveItem = React.useCallback(
    async (item: CartItem) => {
      const remoteId = getCartItemRemoteId(item);
      if (!remoteId) {
        toast({
          tone: 'error',
          title: 'Brak identyfikatora pozycji',
          description: 'Nie udało się usunąć produktu.'
        });
        return;
      }
      setRemovingItemId(item.id);
      try {
        await manager.removeItem({ cartItemId: remoteId });
        toast({
          tone: 'info',
          title: 'Usunięto z koszyka',
          description: item.name
        });
      } catch (error) {
        console.error('[CartSidebar] remove item error', error);
        toast({
          tone: 'error',
          title: 'Nie udało się usunąć produktu',
          description: error instanceof Error ? error.message : undefined
        });
      } finally {
        setRemovingItemId(null);
      }
    },
    [toast, manager]
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000
      }}
    >
      <div
        role="button"
        tabIndex={-1}
        onClick={() => closeCartSidebar()}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,0.45)'
        }}
      />
      <aside
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(420px, 100%)',
          background: '#fff',
          boxShadow: '-8px 0 30px rgba(15,23,42,0.25)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem'
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Twój koszyk</h2>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
              {cart.items.length ? `${cart.items.length} pozycji` : 'Koszyk jest pusty'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => closeCartSidebar()}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
            aria-label="Zamknij koszyk"
          >
            ×
          </button>
        </header>
        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gap: '1rem' }}>
          {cart.items.length ? (
            cart.items.map((item) => (
              <CartSidebarItem
                key={item.id}
                item={item}
                currency={currency}
                updating={updatingItemId === item.id}
                removing={removingItemId === item.id}
                onUpdateQuantity={getUpdateHandler(item)}
                onRemove={() => handleRemoveItem(item)}
              />
            ))
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>
              Brak produktów w koszyku.
            </div>
          )}
        </div>
        <footer style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700
            }}
          >
            <span>Razem</span>
            <span>{formatPrice(totalCents, currency)}</span>
          </div>
          <a
            href="/cart"
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              borderRadius: '999px',
              background: '#0f172a',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600
            }}
            onClick={() => closeCartSidebar()}
          >
            Przejdź do koszyka
          </a>
        </footer>
      </aside>
    </div>
  );
};

export default CartSidebar;
