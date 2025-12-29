// @env: mixed
import React from 'react';
import { CustomerRegisterForm } from '../components/CustomerRegisterForm';

export const RegisterPage: React.FC = () => (
  <section className="card" style={{ maxWidth: '480px' }}>
    <h1 style={{ marginTop: 0 }}>Rejestracja</h1>
    <CustomerRegisterForm />
  </section>
);

export default RegisterPage;
