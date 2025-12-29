// @env: mixed
import React from 'react';
import { customerManager } from '../services/customerManager';

export const CustomerBootstrap: React.FC = () => {
  React.useEffect(() => {
    customerManager.bootstrap();
  }, []);

  return null;
};

export default CustomerBootstrap;
