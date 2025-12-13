// @env: mixed
import { QueryBuilder } from 'renia-graphql-client/builder';
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import type { SelectionNode } from 'renia-graphql-client/types';

export type RegistrationFieldValidation = {
  minLength?: number;
  maxLength?: number;
  inputValidation?: string;
};

export type RegistrationFormField = {
  code: string;
  label: string;
  entityType?: string;
  inputType: 'text' | 'textarea' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  sortOrder: number;
  note?: string | null;
  defaultValue?: string | null;
  options?: { value: string; label: string }[];
  multilineCount?: number | null;
  validation?: RegistrationFieldValidation;
};

type AttributesFormItem = {
  code?: string | null;
  label?: string | null;
  entity_type?: string | null;
  frontend_input?: string | null;
  is_required?: boolean | null;
  sort_order?: number | null;
  default_value?: string | null;
  input_filter?: string | null;
  multiline_count?: number | null;
  note?: string | null;
  options?: { value?: string | null; label?: string | null }[] | null;
  validation_rules?: { name?: string | null; value?: string | null }[] | null;
};

type AttributesFormResponse = {
  attributesForm?: {
    items?: AttributesFormItem[] | null;
    errors?: { type?: string | null; message?: string | null }[] | null;
  } | null;
};

type GraphQLErrorLike = {
  message?: string;
  [key: string]: unknown;
} | null;

type AttributesFormQueryResponse = {
  data?: AttributesFormResponse | null;
  errors?: GraphQLErrorLike[] | null;
};

type BuildAttributesFormQueryOptions = {
  includeExtendedMetadata?: boolean;
};

const buildAttributesFormQuery = (options: BuildAttributesFormQueryOptions = {}) => {
  const includeExtendedMetadata = options.includeExtendedMetadata ?? true;
  const builder = new QueryBuilder('query').setName('RegistrationAttributesForm');
  builder.setVariable('formCode', 'String!');
  builder.addField([], 'attributesForm', {
    args: {
      formCode: '$formCode'
    }
  });
  const itemsPath = ['attributesForm', 'items'];
  builder.addField(itemsPath, 'code');
  builder.addField(itemsPath, 'label');
  builder.addField(itemsPath, 'entity_type');
  builder.addField(itemsPath, 'frontend_input');
  builder.addField(itemsPath, 'is_required');
  builder.addField(itemsPath, 'default_value');
  builder.addField(itemsPath, 'options');
  builder.addField([...itemsPath, 'options'], 'value');
  builder.addField([...itemsPath, 'options'], 'label');
  const inlineSelection: SelectionNode[] = [
    { name: 'sort_order' },
    { name: 'input_filter' },
    { name: 'multiline_count' }
  ];
  if (includeExtendedMetadata) {
    inlineSelection.push({ name: 'note' });
    inlineSelection.push({
      name: 'validation_rules',
      children: [
        { name: 'name' },
        { name: 'value' }
      ]
    });
  }
  builder.inlineFragment(itemsPath, 'CustomerAttributeMetadata', inlineSelection);
  builder.addField(['attributesForm'], 'errors');
  builder.addField(['attributesForm', 'errors'], 'type');
  builder.addField(['attributesForm', 'errors'], 'message');
  return builder;
};

let cachedFields: RegistrationFormField[] | null = null;
let inFlight: Promise<RegistrationFormField[]> | null = null;

const IGNORED_ATTRIBUTE_CODES = new Set([
  'created_at',
  'updated_at',
  'group_id',
  'default_billing',
  'default_shipping',
  'disable_auto_group_change',
  'website_id',
  'store_id'
]);

const SUPPORTED_INPUTS: Record<string, RegistrationFormField['inputType']> = {
  text: 'text',
  textarea: 'textarea',
  multiline: 'textarea',
  multiselect: 'multiselect',
  select: 'select',
  date: 'date',
  datetime: 'date',
  boolean: 'boolean',
  yesno: 'boolean'
};

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseValidationRules = (
  rules?: { name?: string | null; value?: string | null }[] | null
): RegistrationFieldValidation | undefined => {
  if (!rules?.length) return undefined;
  const validation: RegistrationFieldValidation = {};
  rules.forEach((rule) => {
    if (!rule?.name) return;
    const value = rule.value ?? undefined;
    switch (rule.name) {
      case 'min_text_length':
      case 'minimum-length':
        validation.minLength = parseNumber(value);
        break;
      case 'max_text_length':
      case 'maximum-length':
        validation.maxLength = parseNumber(value);
        break;
      case 'input_validation':
        if (value) validation.inputValidation = value;
        break;
      default:
        break;
    }
  });
  return validation;
};

const mapItemToField = (item: AttributesFormItem): RegistrationFormField | null => {
  const code = item.code?.trim();
  if (!code || IGNORED_ATTRIBUTE_CODES.has(code)) return null;
  const label = item.label?.trim() || code;
  const normalizedInput = item.frontend_input ? item.frontend_input.toLowerCase() : 'text';
  const inputType = SUPPORTED_INPUTS[normalizedInput] ?? 'text';
  const options =
    item.options
      ?.map((option) => ({
        value: option?.value ?? '',
        label: option?.label ?? ''
      }))
      .filter((option) => option.value !== '' || option.label !== '') ?? undefined;

  return {
    code,
    label,
    entityType: item.entity_type ?? undefined,
    inputType,
    required: Boolean(item.is_required),
    sortOrder: typeof item.sort_order === 'number' ? item.sort_order : Number.MAX_SAFE_INTEGER,
    note: item.note ?? undefined,
    defaultValue: item.default_value ?? undefined,
    options: options && options.length ? options : undefined,
    multilineCount: item.multiline_count ?? undefined,
    validation: parseValidationRules(item.validation_rules)
  };
};

const normalizeFields = (items: AttributesFormItem[]): RegistrationFormField[] => {
  const fields = items
    .map((item) => mapItemToField(item))
    .filter((item): item is RegistrationFormField => !!item);
  const unique = new Map<string, RegistrationFormField>();
  fields.forEach((field) => {
    if (!unique.has(field.code)) {
      unique.set(field.code, field);
    }
  });
  return Array.from(unique.values()).sort((a, b) => a.sortOrder - b.sortOrder);
};

const EXTENDED_METADATA_ERROR_TOKENS = ['"note"', '"validation_rules"'];

const isExtendedMetadataError = (message: string) =>
  EXTENDED_METADATA_ERROR_TOKENS.some((token) => message.includes(token));

const shouldRetryWithoutExtendedMetadata = (errors?: GraphQLErrorLike[] | null) =>
  Boolean(
    errors?.length &&
      errors.every((error) => {
        if (!error || typeof error.message !== 'string') {
          return false;
        }
        return isExtendedMetadataError(error.message);
      })
  );

const fetchAttributesFormResponse = async (
  formCode: string,
  includeExtendedMetadata: boolean
): Promise<AttributesFormQueryResponse> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildAttributesFormQuery({ includeExtendedMetadata }),
    variables: { formCode },
    operationId: includeExtendedMetadata
      ? 'magentoCustomer.attributesForm.extended'
      : 'magentoCustomer.attributesForm.basic'
  });
  return executeGraphQLRequest(request) as Promise<AttributesFormQueryResponse>;
};

export const getRegistrationFormFields = async (
  options: { forceRefresh?: boolean; formCode?: string } = {}
): Promise<RegistrationFormField[]> => {
  const formCode = options.formCode ?? 'customer_account_create';
  if (cachedFields && !options.forceRefresh) {
    return cachedFields;
  }

  if (!inFlight) {
    inFlight = (async () => {
      let response = await fetchAttributesFormResponse(formCode, true);
      if (shouldRetryWithoutExtendedMetadata(response.errors)) {
        console.warn(
          '[customer][attributesForm] Extended metadata fields not supported. Retrying with basic schema.'
        );
        response = await fetchAttributesFormResponse(formCode, false);
      }
      if (response.errors?.length) {
        throw new Error('Nie udało się pobrać metadanych formularza klientów.');
      }
      const data = response.data?.attributesForm;
      if (data?.errors?.length) {
        console.warn('[customer][attributesForm] errors', data.errors);
      }
      const items = data?.items ?? [];
      const fields = normalizeFields(items);
      cachedFields = fields;
      return fields;
    })().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
};

export const clearCachedRegistrationFields = () => {
  cachedFields = null;
};
