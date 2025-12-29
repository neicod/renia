// @env: mixed
import type { ConfigurableOption } from 'renia-magento-configurable-product/types';
import { getLogger } from 'renia-logger';

const logger = getLogger();

/**
 * Encodes a single configurable option to base64 format
 * Magento expects format: base64('configurable/{attributeId}/{valueIndex}')
 *
 * @param attributeId - The attribute ID (e.g., "93" for color)
 * @param valueIndex - The value index (e.g., "1" for blue)
 * @returns Base64-encoded option string
 */
export const encodeConfigurableOption = (
  attributeId: string,
  valueIndex: number
): string => {
  const optionString = `configurable/${attributeId}/${valueIndex}`;
  // Use btoa for browser and Buffer for Node.js (SSR compatibility)
  const encoded = typeof window !== 'undefined'
    ? btoa(optionString)
    : Buffer.from(optionString).toString('base64');
  return encoded;
};

/**
 * Generates array of base64-encoded selected options for Magento GraphQL mutation
 * Maps user selections (attributeCode -> valueIndex) to Magento format
 *
 * @param selectedOptions - Map of attribute codes to selected value indexes
 * @param configurableOptions - Array of available configurable options (contains attributeId)
 * @returns Array of base64-encoded option strings
 */
export const generateSelectedOptions = (
  selectedOptions: Record<string, number>,
  configurableOptions: ConfigurableOption[]
): string[] => {
  const encoded: string[] = [];

  // For each selected option
  for (const [attributeCode, valueIndex] of Object.entries(selectedOptions)) {
    // Find the corresponding configurable option to get attributeId
    const option = configurableOptions.find(
      (opt) => opt.attributeCode === attributeCode
    );

    if (!option) {
      logger.warn(
        'optionsEncoder',
        `Configurable option not found for attributeCode: ${attributeCode}`
      );
      continue;
    }

    // Encode the option using attributeId and valueIndex
    const encodedOption = encodeConfigurableOption(
      option.attributeId,
      valueIndex
    );
    encoded.push(encodedOption);
  }

  return encoded;
};
