// @env: mixed
import React from 'react';

type Tone = 'muted' | 'error' | 'info';

type MenuStateMessageProps = {
  message: string;
  tone?: Tone;
};

const toneColors: Record<Tone, string> = {
  muted: '#6b7280',
  error: '#b91c1c',
  info: '#0f172a'
};

/**
 * Komponent do wyświetlania komunikatów stanu menu (loading, error, empty).
 *
 * Implementuje SOLID: SRP (single responsibility - status message display)
 *                     OCP (extensible via tone prop)
 */
export const MenuStateMessage: React.FC<MenuStateMessageProps> = ({
  message,
  tone = 'muted'
}) => {
  return (
    <div className="main-menu">
      <span style={{ color: toneColors[tone], fontSize: '0.95rem' }}>
        {message}
      </span>
    </div>
  );
};

export default MenuStateMessage;
