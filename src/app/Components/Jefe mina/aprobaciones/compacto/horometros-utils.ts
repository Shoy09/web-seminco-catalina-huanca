export function calcularDiferenciaHorometro(fila: {
  inicial: number | string | null;
  final: number | string | null;
}): number | null {
  if (fila.inicial === null || fila.final === null || fila.inicial === '' || fila.final === '') return null;
  const inicial = Number(fila.inicial);
  const final = Number(fila.final);
  return Number.isFinite(inicial) && Number.isFinite(final) ? final - inicial : null;
}
