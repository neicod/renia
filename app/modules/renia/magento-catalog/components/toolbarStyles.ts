// @env: mixed

/**
 * Shared styles for ProductListingToolbar components
 *
 * Extracted to separate file for clarity and reusability
 */

export const toolbarStyles = {
  container: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: '1rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1.25rem',
    padding: '0.9rem 1.1rem',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)'
  },

  infoText: {
    color: '#0f172a',
    fontSize: '0.95rem',
    fontWeight: 500 as const
  },

  selectorsContainer: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.85rem',
    flexWrap: 'wrap' as const
  },

  label: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '0.45rem'
  },

  labelText: {
    color: '#64748b',
    fontSize: '0.9rem'
  },

  select: {
    padding: '0.45rem 0.9rem',
    borderRadius: '999px',
    border: '1px solid #d7def0',
    background: '#f8faff',
    color: '#0f172a'
  }
};

export default toolbarStyles;
