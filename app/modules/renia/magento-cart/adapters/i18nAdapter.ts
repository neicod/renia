// @env: mixed
import { useI18n as useReniaI18n } from 'renia-i18n/hooks/useI18n';
import type { ILocalizationService } from '../interfaces/services';

/**
 * Adapter Pattern: useReniaI18n() → ILocalizationService
 *
 * Opakowuje konkretną implementację useI18n do interfejsu ILocalizationService.
 * Pozwala na:
 * - Testowanie z mock'iem zamiast prawdziwego i18n
 * - Zamianę implementacji bez zmiany kodu consumer'a (hook)
 * - Loose coupling między useAddToCart i renia-i18n
 *
 * @returns ILocalizationService adapter dla useReniaI18n()
 */
export function createI18nAdapter(): ILocalizationService {
  const { t } = useReniaI18n();

  return {
    translate(key, variables) {
      return t(key, variables);
    },

    t(key, variables) {
      return t(key, variables);
    }
  };
}

/**
 * Hook version - dla użytku w komponentach
 * Tworzy nowy adapter za każdym razem - idealny do użytku w hook'ach React
 *
 * @returns ILocalizationService adapter
 */
export function useI18nAdapter(): ILocalizationService {
  return createI18nAdapter();
}
