export function csvCell(value: unknown) {
  const v = String(value ?? "");
  const safe = /^[\s]*[=+@-]/.test(v) ? "'" + v : v;
  return '"' + safe.replaceAll('"', '""') + '"';
}
