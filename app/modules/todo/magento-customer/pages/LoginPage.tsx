// @env: mixed
import React from 'react';
import { CustomerLoginForm } from '../components/CustomerLoginForm';

export const LoginPage: React.FC = () => (
  <section className="card" style={{ maxWidth: '480px' }}>
    <h1 style={{ marginTop: 0 }}>Logowanie</h1>
    <CustomerLoginForm />
  </section>
);

export default LoginPage;
