// @env: mixed

const trimEmptyEdges = (lines: string[]): string[] => {
  let start = 0;
  while (start < lines.length && lines[start].trim() === '') start += 1;
  let end = lines.length - 1;
  while (end >= start && lines[end].trim() === '') end -= 1;
  return lines.slice(start, end + 1);
};

const dedent = (input: string): string => {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const trimmed = trimEmptyEdges(lines);
  if (!trimmed.length) return '';

  const indents = trimmed
    .filter((line) => line.trim() !== '')
    .map((line) => (line.match(/^\s*/)?.[0].length ?? 0));
  const minIndent = indents.length ? Math.min(...indents) : 0;

  return trimmed.map((line) => line.slice(minIndent)).join('\n');
};

export const gql = (strings: TemplateStringsArray, ...values: Array<string | number>) => {
  const combined = strings.reduce((acc, part, idx) => {
    const value = values[idx];
    return acc + part + (value === undefined ? '' : String(value));
  }, '');
  return dedent(combined);
};

export default {
  gql
};
