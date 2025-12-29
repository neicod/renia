// @env: mixed
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerManager } from '../services/customerManager';
import { useCustomer } from '../hooks/useCustomer';

export const CustomerLoginForm: React.FC = () => {
  const customerState = useCustomer();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await customerManager.login(email, password);
      setMessage('Zalogowano pomyślnie.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nie udało się zalogować.');
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (customerState.status === 'authenticated') {
      navigate(redirectTo, { replace: true });
    }
  }, [customerState.status, navigate, redirectTo]);

  if (customerState.status === 'authenticated') {
    return (
      <div>
        <p>Jesteś zalogowany jako {customerState.customer?.firstname ?? customerState.customer?.email}.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'grid', gap: '0.75rem', maxWidth: '360px', width: '100%' }}
    >
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5f5' }}
        />
      </label>
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span>Hasło</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          background: '#0f172a',
          color: '#fff',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer'
        }}
      >
        {submitting ? 'Logowanie...' : 'Zaloguj się'}
      </button>
      {message ? <p style={{ color: '#0f172a' }}>{message}</p> : null}
    </form>
  );
};

export default CustomerLoginForm;
