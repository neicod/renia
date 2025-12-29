// @env: browser
import { useToast as useReniaToast } from 'renia-ui-toast/hooks/useToast';
import type { INotificationService } from '../interfaces/services';

/**
 * Adapter Pattern: useReniaToast() → INotificationService
 *
 * Opakowuje konkretną implementację useToast do interfejsu INotificationService.
 * Pozwala na:
 * - Testowanie z mock'iem zamiast prawdziwym toast
 * - Zamianę implementacji bez zmiany kodu consumer'a (hook)
 * - Loose coupling między useAddToCart i renia-ui-toast
 *
 * @returns INotificationService adapter dla useReniaToast()
 */
export function createToastAdapter(): INotificationService {
  const toast = useReniaToast();

  return {
    success({ title, description }) {
      toast({
        tone: 'success',
        title,
        description
      });
    },

    error({ title, description }) {
      toast({
        tone: 'error',
        title,
        description
      });
    }
  };
}

/**
 * Hook version - dla użytku w komponentach
 * Tworzy nowy adapter za każdym razem - idealny do użytku w hook'ach React
 *
 * @returns INotificationService adapter
 */
export function useToastAdapter(): INotificationService {
  return createToastAdapter();
}
