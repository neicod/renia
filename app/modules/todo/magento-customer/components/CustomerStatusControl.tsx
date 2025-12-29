// @env: mixed
import React from 'react';
import { useCustomer } from '../hooks/useCustomer';
import { customerManager } from '../services/customerManager';

export const CustomerStatusControl: React.FC = () => {
  const customerState = useCustomer();

  if (customerState.status === 'authenticated') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>
          Witaj, {customerState.customer?.firstname ?? customerState.customer?.email}
        </span>
        <button
          type="button"
          onClick={() => customerManager.logout()}
          style={{
            border: '1px solid #d1d5db',
            padding: '0.3rem 0.7rem',
            borderRadius: '999px',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          Wyloguj
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <a href="/login" style={{ textDecoration: 'none', fontWeight: 600, color: '#0f172a' }}>
        Zaloguj
      </a>
      <a href="/register" style={{ textDecoration: 'none', fontWeight: 600, color: '#2563eb' }}>
        Rejestracja
      </a>
    </div>
  );
};

export default CustomerStatusControl;
