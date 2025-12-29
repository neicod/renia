// @env: server

const escapeJsonForHtmlScript = (json: string): string => {
  // Prevent breaking out of <script> and handle a couple of edge-case code points.
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
};

export const serializeBootstrapScript = (bootstrap: unknown): string => {
  if (bootstrap === undefined) return '';
  const json = JSON.stringify(bootstrap);
  return `<script>window.__APP_BOOTSTRAP__=${escapeJsonForHtmlScript(json)};</script>`;
};

export default {
  serializeBootstrapScript
};

