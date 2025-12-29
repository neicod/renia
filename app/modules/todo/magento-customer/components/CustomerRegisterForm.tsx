// @env: mixed
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppEnvironment } from '@renia/framework/runtime/AppEnvContext';
import { customerManager } from '../services/customerManager';
import { useCustomer } from '../hooks/useCustomer';
import {
  getRegistrationFormFields,
  type RegistrationFormField
} from '../services/registrationAttributes';

type FieldValue = string | string[] | boolean;

const CORE_CUSTOMER_FIELDS = new Set([
  'email',
  'firstname',
  'lastname',
  'middlename',
  'prefix',
  'suffix',
  'dob',
  'gender',
  'taxvat',
  'is_subscribed'
]);

const ensureNewsletterField = (fields: RegistrationFormField[]): RegistrationFormField[] => {
  if (fields.some((field) => field.code === 'is_subscribed')) {
    return fields;
  }
  return [
    ...fields,
    {
      code: 'is_subscribed',
      label: 'Zapisz mnie do newslettera',
      inputType: 'boolean',
      required: false,
      sortOrder: (fields.at(-1)?.sortOrder ?? Number.MAX_SAFE_INTEGER) + 5
    }
  ];
};

const getInitialValue = (field: RegistrationFormField, previous?: FieldValue): FieldValue => {
  if (previous !== undefined) {
    return previous;
  }
  if (field.inputType === 'boolean') {
    return field.defaultValue === '1' || field.defaultValue === 'true';
  }
  if (field.inputType === 'multiselect') {
    return field.defaultValue ? field.defaultValue.split(',') : [];
  }
  return field.defaultValue ?? '';
};

const buildCustomerInput = (
  fields: RegistrationFormField[],
  values: Record<string, FieldValue>
): Record<string, unknown> => {
  const customer: Record<string, unknown> = {};
  const customAttributes: { attribute_code: string; value: string }[] = [];

  fields.forEach((field) => {
    const rawValue = values[field.code];
    if (rawValue === undefined || rawValue === null) return;

    if (field.inputType === 'boolean') {
      const boolValue = Boolean(rawValue);
      if (!boolValue && !field.required) {
        return;
      }
      if (CORE_CUSTOMER_FIELDS.has(field.code)) {
        customer[field.code] = boolValue;
      } else {
        customAttributes.push({
          attribute_code: field.code,
          value: boolValue ? '1' : '0'
        });
      }
      return;
    }

    const hasValue =
      Array.isArray(rawValue) ? rawValue.length > 0 : String(rawValue).trim().length > 0;
    if (!hasValue) return;

    const normalized =
      field.inputType === 'multiselect' && Array.isArray(rawValue)
        ? rawValue.join(',')
        : Array.isArray(rawValue)
          ? rawValue.join(',')
          : String(rawValue);

    if (CORE_CUSTOMER_FIELDS.has(field.code)) {
      customer[field.code] = normalized;
    } else {
      customAttributes.push({
        attribute_code: field.code,
        value: normalized
      });
    }
  });

  if (customAttributes.length) {
    customer.custom_attributes = customAttributes;
  }

  return customer;
};

export const CustomerRegisterForm: React.FC = () => {
  const customerState = useCustomer();
  const { store } = useAppEnvironment();
  const passwordPolicy = (store as { passwordPolicy?: { minLength?: number; requiredCharacterClasses?: number } } | null)
    ?.passwordPolicy;
  const minPasswordLength = passwordPolicy?.minLength ?? 8;
  const requiredCharacterClasses = passwordPolicy?.requiredCharacterClasses ?? 0;
  const [fields, setFields] = React.useState<RegistrationFormField[]>([]);
  const [fieldValues, setFieldValues] = React.useState<Record<string, FieldValue>>({});
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [attributesStatus, setAttributesStatus] =
    React.useState<'loading' | 'ready' | 'error'>('loading');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const remoteFields = await getRegistrationFormFields();
        if (!mounted) return;
        if (!remoteFields.length) {
          console.error('[CustomerRegisterForm] Magento nie zwróciło żadnych pól formularza.');
          setAttributesStatus('error');
          return;
        }
        const preparedFields = ensureNewsletterField(remoteFields);
        setFields(preparedFields);
        setFieldValues((prev) => {
          const next: Record<string, FieldValue> = {};
          preparedFields.forEach((field) => {
            next[field.code] = getInitialValue(field, prev[field.code]);
          });
          return next;
        });
        setAttributesStatus('ready');
      } catch (error) {
        console.error('[CustomerRegisterForm] Nie udało się pobrać pól formularza', error);
        if (!mounted) return;
        setAttributesStatus('error');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (customerState.status === 'authenticated') {
      navigate(redirectTo, { replace: true });
    }
  }, [customerState.status, navigate, redirectTo]);

  const updateValue = React.useCallback((code: string, value: FieldValue) => {
    setFieldValues((prev) => ({
      ...prev,
      [code]: value
    }));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Hasła nie są zgodne.');
      return;
    }
    if (password.length < minPasswordLength) {
      setMessage(`Hasło musi mieć co najmniej ${minPasswordLength} znaków.`);
      return;
    }
    if (requiredCharacterClasses > 0) {
      const classCount = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password)
      ].filter(Boolean).length;
      if (classCount < requiredCharacterClasses) {
        setMessage(
          `Hasło musi zawierać znaki z minimum ${requiredCharacterClasses} spośród: małe litery, wielkie litery, cyfry, znaki specjalne.`
        );
        return;
      }
    }
    if (!fields.length) {
      setMessage('Formularz nie został wczytany.');
      return;
    }
    const customerInput = buildCustomerInput(fields, fieldValues);
    if (!customerInput.email) {
      setMessage('Adres email jest wymagany.');
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await customerManager.register({
        customer: customerInput,
        password
      });
      setMessage('Konto utworzono i zalogowano.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nie udało się utworzyć konta.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: RegistrationFormField) => {
    const value = fieldValues[field.code];
    const commonInputStyle = {
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #cbd5f5'
    } as React.CSSProperties;
    const minLength = field.validation?.minLength;
    const maxLength = field.validation?.maxLength;
    const inputValidation = field.validation?.inputValidation;

    if (field.inputType === 'boolean') {
      return (
        <div key={field.code} style={{ padding: '0.25rem 0', display: 'grid', gap: '0.25rem' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500
            }}
            >
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => updateValue(field.code, event.target.checked)}
              />
              {field.label}
            </label>
          {field.note || minLength || maxLength ? (
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {[field.note, minLength ? `Min. długość: ${minLength}` : null, maxLength ? `Max: ${maxLength}` : null]
                .filter(Boolean)
                .join(' · ')}
            </span>
          ) : null}
        </div>
      );
    }

    const control = (() => {
      switch (field.inputType) {
        case 'textarea':
          return (
            <textarea
              required={field.required}
              minLength={minLength}
              maxLength={maxLength}
              value={typeof value === 'string' ? value : ''}
              onChange={(event) => updateValue(field.code, event.target.value)}
              rows={field.multilineCount ?? 3}
              style={{ ...commonInputStyle, resize: 'vertical' }}
            />
          );
        case 'date':
          return (
            <input
              type="date"
              required={field.required}
              minLength={minLength}
              maxLength={maxLength}
              value={typeof value === 'string' ? value : ''}
              onChange={(event) => updateValue(field.code, event.target.value)}
              style={commonInputStyle}
            />
          );
        case 'select':
          return (
            <select
              required={field.required}
              value={typeof value === 'string' ? value : ''}
              onChange={(event) => updateValue(field.code, event.target.value)}
              style={commonInputStyle}
            >
              <option value="">Wybierz...</option>
              {(field.options ?? []).map((option) => (
                <option key={`${field.code}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        case 'multiselect': {
          const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
          return (
            <select
              multiple
              required={field.required}
              value={selected as string[]}
              onChange={(event) => {
                const options = Array.from(event.target.selectedOptions).map((opt) => opt.value);
                updateValue(field.code, options);
              }}
              style={{ ...commonInputStyle, minHeight: '120px' }}
            >
              {(field.options ?? []).map((option) => (
                <option key={`${field.code}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
        default:
          return (
            <input
              type={
                inputValidation === 'email' || field.code === 'email'
                  ? 'email'
                  : inputValidation === 'digits'
                    ? 'text'
                    : 'text'
              }
              required={field.required}
              minLength={minLength}
              maxLength={maxLength}
              inputMode={inputValidation === 'digits' ? 'numeric' : undefined}
              pattern={inputValidation === 'digits' ? '[0-9]*' : undefined}
              value={typeof value === 'string' ? value : ''}
              onChange={(event) => updateValue(field.code, event.target.value)}
              style={commonInputStyle}
            />
          );
      }
    })();

    return (
      <label key={field.code} style={{ display: 'grid', gap: '0.35rem' }}>
        <span>
          {field.label}
          {field.required ? ' *' : ''}
        </span>
        {control}
        {field.note || minLength || maxLength ? (
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {[field.note, minLength ? `Min. długość: ${minLength}` : null, maxLength ? `Max: ${maxLength}` : null]
              .filter(Boolean)
              .join(' · ')}
          </span>
        ) : null}
      </label>
    );
  };

  if (attributesStatus === 'loading') {
    return <p style={{ color: '#6b7280' }}>Ładowanie konfiguracji formularza...</p>;
  }

  if (attributesStatus === 'error') {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px', width: '100%' }}
    >
      {fields.map((field) => renderField(field))}
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span>Hasło *</span>
        <input
          type="password"
          required
          minLength={minPasswordLength}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5f5' }}
        />
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Hasło musi mieć co najmniej {minPasswordLength} znaków
          {requiredCharacterClasses > 0
            ? ` oraz zawierać znaki z ${requiredCharacterClasses} spośród: małe litery, wielkie litery, cyfry, znaki specjalne.`
            : '.'}
        </span>
      </label>
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span>Powtórz hasło *</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5f5' }}
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '0.65rem 1rem',
          borderRadius: '999px',
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer'
        }}
      >
        {submitting ? 'Rejestracja...' : 'Utwórz konto'}
      </button>
      {message ? <p style={{ color: '#0f172a' }}>{message}</p> : null}
    </form>
  );
};

export default CustomerRegisterForm;
