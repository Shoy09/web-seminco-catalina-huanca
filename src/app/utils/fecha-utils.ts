export type TipoPeriodo = 'DIA' | 'SEMANA' | 'MES';

export const MESES_CORTOS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
];

export function parseFechaLocal(fecha: string): Date | null {
  if (!fecha) return null;

  const partes = fecha.split('-').map(Number);

  if (partes.length !== 3) return null;

  const [year, month, day] = partes;

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function formatearFechaDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function obtenerSemanaISO(date: Date): { year: number; week: number } {
  const temp = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));

  const dayNum = temp.getUTCDay() || 7;

  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));

  const week = Math.ceil(
    (((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );

  return {
    year: temp.getUTCFullYear(),
    week
  };
}

export function obtenerRangoSemanaISO(date: Date) {
  const temp = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diaSemana = temp.getDay() || 7;

  const lunes = new Date(temp);
  lunes.setDate(temp.getDate() - diaSemana + 1);

  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  return {
    fechaInicio: formatearFechaDDMMYYYY(lunes),
    fechaFin: formatearFechaDDMMYYYY(domingo)
  };
}

export function generarDiasEntreFechas(fechaInicio: string, fechaFin: string) {
  const inicio = parseFechaLocal(fechaInicio);
  const fin = parseFechaLocal(fechaFin);

  if (!inicio || !fin) return [];

  const dias: any[] = [];

  const fechaActual = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate()
  );

  const fechaFinal = new Date(
    fin.getFullYear(),
    fin.getMonth(),
    fin.getDate()
  );

  while (fechaActual <= fechaFinal) {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth() + 1;
    const day = fechaActual.getDate();

    const mes = String(month).padStart(2, '0');
    const dia = String(day).padStart(2, '0');

    dias.push({
      key: `${year}-${mes}-${dia}`,
      label: `${dia}/${mes}/${year}`
    });

    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return dias;
}

export function obtenerPeriodo(fecha: string, tipo: TipoPeriodo) {
  const date = parseFechaLocal(fecha);

  if (!date) return null;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (tipo === 'DIA') {
    const mes = String(month).padStart(2, '0');
    const dia = String(day).padStart(2, '0');

    return {
      key: `${year}-${mes}-${dia}`,
      label: `${dia}/${mes}/${year}`,
      anio: year
    };
  }

  if (tipo === 'MES') {
    const mes = String(month).padStart(2, '0');
    const nombreMes = MESES_CORTOS[month - 1];

    return {
      key: `${year}-${mes}`,
      label: nombreMes,
      anio: year
    };
  }

  if (tipo === 'SEMANA') {
    const semana = obtenerSemanaISO(date);
    const semanaTexto = String(semana.week).padStart(2, '0');
    const rango = obtenerRangoSemanaISO(date);

    return {
      key: `${semana.year}-S${semanaTexto}`,
      label: `S${semanaTexto}`,
      anio: semana.year,
      fechaInicio: rango.fechaInicio,
      fechaFin: rango.fechaFin
    };
  }

  return null;
}

export function obtenerPeriodoDesdeKey(
  fechaKey: string,
  tipo: 'SEMANA' | 'MES'
) {
  const date = parseFechaLocal(fechaKey);

  if (!date) return null;

  return obtenerPeriodo(fechaKey, tipo);
}

export function parseFechaSimple(fecha: string): Date | null {
  if (!fecha) return null;

  const partes = fecha.split('-').map(Number);

  if (partes.length !== 3) return null;

  const [year, month, day] = partes;

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}