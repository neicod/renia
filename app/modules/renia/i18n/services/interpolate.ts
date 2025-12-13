const namedPattern = /(?<!\\):([a-zA-Z0-9_]+)/g; // :name
const positionalPattern = /(?<!%)%(\d+)/g; // %1, %2 ... (1-based)

const unescape = (text: string) => text.replace(/\\:/g, ':').replace(/%%/g, '%');

export function interpolate(
  template: string,
  params?: Record<string, any> | Array<any>
): string {
  if (!params) return unescape(template);
  let result = template;

  if (Array.isArray(params)) {
    result = result.replace(positionalPattern, (_m, idxStr) => {
      const idx = Number(idxStr) - 1;
      const v = params[idx];
      return v === undefined || v === null ? _m : String(v);
    });
  } else {
    result = result.replace(namedPattern, (_m, key) => {
      const v = (params as Record<string, any>)[key];
      return v === undefined || v === null ? _m : String(v);
    });
  }

  return unescape(result);
}

export function formatMessage(template: string, params?: Record<string, any> | Array<any>) {
  return interpolate(template, params);
}
