// @env: mixed
import React from 'react';

type Tone = 'muted' | 'error' | 'info';

const toneColor: Record<Tone, string> = {
  muted: '#6b7280',
  error: '#b91c1c',
  info: '#0f172a'
};

type Props = {
  message: string;
  tone?: Tone;
};

export const ProductStatus: React.FC<Props> = ({ message, tone = 'muted' }) => (
  <p style={{ color: toneColor[tone] }}>{message}</p>
);

export default ProductStatus;
