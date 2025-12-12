// @env: mixed
import React from 'react';
import { toastStore, dismissToast, type ToastItem } from '../services/toastStore';

const useToastState = () =>
  React.useSyncExternalStore(toastStore.subscribe, toastStore.getState, toastStore.getState);

const toneStyles: Record<string, { bg: string; border: string }> = {
  success: { bg: '#ecfdf5', border: '#34d399' },
  error: { bg: '#fef2f2', border: '#f87171' },
  info: { bg: '#eff6ff', border: '#60a5fa' }
};

export const ToastViewport: React.FC = () => {
  const toasts = useToastState();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        display: 'grid',
        gap: '0.5rem',
        zIndex: 9999
      }}
    >
      {toasts.map((toast) => {
        const tone = toneStyles[toast.tone ?? 'info'];
        return (
          <div
            key={toast.id}
            style={{
              minWidth: '240px',
              maxWidth: '320px',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              boxShadow: '0 10px 25px rgba(15,23,42,0.15)',
              color: '#0f172a'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                {toast.title ? (
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{toast.title}</div>
                ) : null}
                {toast.description ? (
                  <div style={{ fontSize: '0.9rem', color: '#475569' }}>{toast.description}</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                aria-label="Zamknij powiadomienie"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastViewport;
