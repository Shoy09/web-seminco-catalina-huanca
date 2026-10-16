export const PROCESOS_CHECKLIST = [
  'PERFORACIÓN TALADROS LARGOS', 'PERFORACIÓN HORIZONTAL', 'EMPERNADOR',
  'SCISSOR', 'SCALAMIN', 'ROMPEBANCOS', 'ANFOCHANGER', 'SCOOPTRAM', 'DUMPER',
];

export function normalizarChecklist(value: unknown): string {
  return String(value ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

export function sugerenciasChecklist(valores: (string | null | undefined)[]): string[] {
  const unicos = new Map<string, string>();
  valores.forEach(valor => {
    const limpio = valor?.trim();
    if (limpio && !unicos.has(normalizarChecklist(limpio))) unicos.set(normalizarChecklist(limpio), limpio);
  });
  return [...unicos.values()].sort((a, b) => a.localeCompare(b, 'es'));
}

export function reutilizarValorChecklist(valor: unknown, sugerencias: string[]): string {
  return sugerencias.find(s => normalizarChecklist(s) === normalizarChecklist(valor)) ?? String(valor ?? '').trim();
}

export interface FilaIngresoChecklist { categoria: string; nombre: string; }

export function leerFilasChecklist(rows: unknown[][], categorias: string[]): { filas: FilaIngresoChecklist[]; errores: string[] } {
  const errores: string[] = [], filas: FilaIngresoChecklist[] = [];
  const encabezados = (rows[0] ?? []).map(normalizarChecklist);
  const categoriaIndex = encabezados.indexOf('CATEGORIA'), nombreIndex = encabezados.indexOf('NOMBRE');
  if (categoriaIndex < 0 || nombreIndex < 0 || encabezados.some(h => h && !['CATEGORIA', 'NOMBRE'].includes(h))
    || encabezados.filter(h => h === 'CATEGORIA').length !== 1 || encabezados.filter(h => h === 'NOMBRE').length !== 1) {
    return { filas, errores: ['La primera fila debe contener únicamente las columnas Categoría y Nombre. El proceso y los equipos se seleccionan en este formulario.'] };
  }
  const vistos = new Set<string>();
  rows.slice(1).forEach((row, index) => {
    if (row.every(value => value === null || value === undefined || String(value).trim() === '')) return;
    const categoria = reutilizarValorChecklist(row[categoriaIndex], categorias);
    const nombre = String(row[nombreIndex] ?? '').trim();
    const clave = JSON.stringify([normalizarChecklist(categoria), normalizarChecklist(nombre)]);
    if (!categoria || categoria.length > 255 || !nombre || nombre.length > 255) errores.push(`Fila ${index + 2}: revisa la categoría y el nombre (máximo 255 caracteres).`);
    else if (vistos.has(clave)) errores.push(`Fila ${index + 2}: el ítem está repetido en el archivo.`);
    else { vistos.add(clave); filas.push({ categoria, nombre }); }
  });
  if (!filas.length && !errores.length) errores.push('El archivo no contiene ítems.');
  return { filas, errores };
}
