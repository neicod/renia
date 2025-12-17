// @env: mixed
import { useCartManager as useReniaCartManager } from '../context/CartManagerContext';
import type { ICartService } from '../interfaces/services';

/**
 * Adapter Pattern: useReniaCartManager() → ICartService
 *
 * Opakowuje konkretną implementację CartManagerContext do interfejsu ICartService.
 * Pozwala na:
 * - Testowanie z mock'iem zamiast prawdziwego cart managera
 * - Zamianę implementacji bez zmiany kodu consumer'a (hook)
 * - Loose coupling między useAddToCart i CartManagerContext
 *
 * @returns ICartService adapter dla useReniaCartManager()
 */
export function createCartManagerAdapter(): ICartService {
  const manager = useReniaCartManager();

  return {
    async addProduct({ sku, quantity }) {
      await manager.addProduct({ sku, quantity });
    }
  };
}

/**
 * Hook version - dla użytku w komponentach
 * Tworzy nowy adapter za każdym razem - idealny do użytku w hook'ach React
 *
 * @returns ICartService adapter
 */
export function useCartManagerAdapter(): ICartService {
  return createCartManagerAdapter();
}
