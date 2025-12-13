// @env: mixed
import type { CartItem } from 'renia-module-cart';

export const getCartItemRemoteId = (item: CartItem): number | null => {
  const remote = item.payload && (item.payload as Record<string, unknown>).remoteId;
  if (typeof remote === 'number' && Number.isFinite(remote)) return remote;
  if (typeof remote === 'string') {
    const parsed = Number(remote);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

export default getCartItemRemoteId;
