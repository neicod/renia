// @env: mixed
import React from 'react';
import { I18nContext } from '../context/I18nProvider';

export const useI18n = () => {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within <I18nProvider>');
  }
  return ctx;
};

export default useI18n;
