// @env: server

export const escapeHtmlText = (value: string): string => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const escapeHtmlAttr = (value: string): string => {
  return escapeHtmlText(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

export default {
  escapeHtmlText,
  escapeHtmlAttr
};

