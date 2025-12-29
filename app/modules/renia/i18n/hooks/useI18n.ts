// @env: mixed
import React from 'react';
import { I18nContext } from '../context/I18nProvider.js';

export const useI18n = () => {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    console.error('[useI18n] ERROR: I18nContext not found! Component not wrapped in I18nProvider');
    throw new Error('useI18n must be used within <I18nProvider>');
  }
  return ctx;
};

export default useI18n;
