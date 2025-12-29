// @env: mixed
import React from 'react';
import type { ConfigurableVariant } from '../types';

type Props = {
  variant: ConfigurableVariant;
};

export const SelectedVariantSummary: React.FC<Props> = ({ variant }) => {
  // Don't render anything - variant info is shown in options selector
  return null;
};

export default SelectedVariantSummary;
