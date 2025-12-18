// @env: mixed
export const toolbarStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    padding: '0.85rem 1rem',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    boxShadow: '0 10px 18px rgba(15, 23, 42, 0.08)',
    marginBottom: '1rem'
  },
  infoText: {
    fontSize: '0.95rem',
    color: '#0f172a'
  },
  selectorsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap' as const
  }
};

export default toolbarStyles;

