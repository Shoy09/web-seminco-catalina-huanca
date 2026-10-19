/** Unifica los códigos de labor al preparar las filas del Excel. */
export function normalizarLaborExcel(labor: string | null | undefined): string {
  return String(labor ?? '').trim().toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^([A-Z]+)(?=\d)/, '$1_');
}
