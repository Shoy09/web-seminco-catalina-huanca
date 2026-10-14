/** Duration of a single shift event, allowing an end time on the following day. */
export function duracionSegundos(inicio: string | null | undefined, final: string | null | undefined): number | null {
  const parse = (hora: string | null | undefined): number | null => {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec((hora ?? '').trim());
    if (!match) return null;
    const h = Number(match[1]), m = Number(match[2]), s = Number(match[3] ?? 0);
    if (h > 23 || m > 59 || s > 59) return null;
    return h * 3600 + m * 60 + s;
  };
  const desde = parse(inicio), hasta = parse(final);
  if (desde === null || hasta === null) return null;
  return hasta >= desde ? hasta - desde : hasta - desde + 86400;
}

export function formatearTiempo(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;
  return `${horas} h ${String(minutos).padStart(2, '0')} min${resto ? ` ${resto} s` : ''}`;
}
