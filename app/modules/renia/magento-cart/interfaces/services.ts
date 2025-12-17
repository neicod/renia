// @env: mixed

/**
 * INotificationService - abstrakcja dla powiadomień
 * Implementuje Service Locator Pattern dla testowania i wymienialności
 */
export interface INotificationService {
  /**
   * Wyświetl powiadomienie sukcesu
   */
  success(options: { title: string; description: string }): void;

  /**
   * Wyświetl powiadomienie błędu
   */
  error(options: { title: string; description: string }): void;
}

/**
 * ILocalizationService - abstrakcja dla tłumaczeń
 * Implementuje Service Locator Pattern dla testowania i wymienialności
 */
export interface ILocalizationService {
  /**
   * Przetłumacz klucz z opcjonalnymi zmiennymi
   * @param key - Klucz tłumaczenia (np. 'cart.toast.added.title')
   * @param variables - Zmienne do wstawienia w tłumaczenie
   * @returns Przetłumaczony tekst
   */
  translate(key: string, variables?: Record<string, any>): string;

  /**
   * Alias dla translate() - dla kompatybilności
   */
  t(key: string, variables?: Record<string, any>): string;
}

/**
 * ICartService - abstrakcja dla operacji na koszyku
 * Implementuje Service Locator Pattern dla testowania i wymienialności
 */
export interface ICartService {
  /**
   * Dodaj produkt do koszyka
   * @param options - SKU produktu i ilość
   * @throws Jeśli API zwróci błąd
   */
  addProduct(options: { sku: string; quantity: number }): Promise<void>;
}
