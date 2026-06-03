export type TipoPeriodo = 'DIA' | 'SEMANA' | 'MES';

export const MESES_CORTOS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
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
  const temp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dayNum = temp.getUTCDay() || 7;

  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));

  const week = Math.ceil(
    ((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );

  return {
    year: temp.getUTCFullYear(),
    week,
  };
}

export function obtenerRangoSemanaISO(date: Date) {
  const temp = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diaSemana = temp.getDay() || 7;

  const lunes = new Date(temp);
  lunes.setDate(temp.getDate() - diaSemana + 1);

  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  return {
    fechaInicio: formatearFechaDDMMYYYY(lunes),
    fechaFin: formatearFechaDDMMYYYY(domingo),
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
    inicio.getDate(),
  );

  const fechaFinal = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());

  while (fechaActual <= fechaFinal) {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth() + 1;
    const day = fechaActual.getDate();

    const mes = String(month).padStart(2, '0');
    const dia = String(day).padStart(2, '0');

    dias.push({
      key: `${year}-${mes}-${dia}`,
      label: `${dia}/${mes}/${year}`,
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
      anio: year,
    };
  }

  if (tipo === 'MES') {
    const mes = String(month).padStart(2, '0');
    const nombreMes = MESES_CORTOS[month - 1];

    return {
      key: `${year}-${mes}`,
      label: nombreMes,
      anio: year,
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
      fechaFin: rango.fechaFin,
    };
  }

  return null;
}

export function obtenerPeriodoDesdeKey(
  fechaKey: string,
  tipo: 'SEMANA' | 'MES',
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

export function getFechaHoy(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTurnoActual(): string {
  const hora = new Date().getHours();

  // Día: 07:00 - 18:59
  if (hora >= 7 && hora < 19) {
    return 'DÍA';
  }

  // Noche: 19:00 - 06:59
  return 'NOCHE';
}

export function convertirNumero(valor: any, valorDefault: number = 0): number {
  if (valor === null || valor === undefined || valor === '') {
    return valorDefault;
  }

  const numero = Number(valor);

  return isNaN(numero) ? valorDefault : numero;
}

export function normalizarTexto(valor: any): string {
  return String(valor || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function obtenerRangosHoraPorTurno(turno: string = ''): string[] {
  if (turno === 'DÍA') {
    return [
      '06:00 - 07:00',
      '07:00 - 08:00',
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
    ];
  }

  if (turno === 'NOCHE') {
    return [
      '18:00 - 19:00',
      '19:00 - 20:00',
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00',
    ];
  }

  return [
    '06:00 - 07:00',
    '07:00 - 08:00',
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00',
    '22:00 - 23:00',
    '23:00 - 00:00',
    '00:00 - 01:00',
    '01:00 - 02:00',
    '02:00 - 03:00',
    '03:00 - 04:00',
    '04:00 - 05:00',
    '05:00 - 06:00',
  ];
}

export function obtenerRangoHoraBase(horaStr: string): string {
  if (!horaStr) return 'SIN HORA';

  let [hora, minutos] = horaStr.split(':').map(Number);

  if (isNaN(hora) || isNaN(minutos)) return 'SIN HORA';

  // Si termina exacto en :00 pertenece al rango anterior
  if (minutos === 0) {
    hora = hora === 0 ? 23 : hora - 1;
    minutos = 59;
  }

  if (hora >= 6 && hora < 7) return '06:00 - 07:00';
  if (hora >= 7 && hora < 8) return '07:00 - 08:00';
  if (hora >= 8 && hora < 9) return '08:00 - 09:00';
  if (hora >= 9 && hora < 10) return '09:00 - 10:00';
  if (hora >= 10 && hora < 11) return '10:00 - 11:00';
  if (hora >= 11 && hora < 12) return '11:00 - 12:00';
  if (hora >= 12 && hora < 13) return '12:00 - 13:00';
  if (hora >= 13 && hora < 14) return '13:00 - 14:00';
  if (hora >= 14 && hora < 15) return '14:00 - 15:00';
  if (hora >= 15 && hora < 16) return '15:00 - 16:00';
  if (hora >= 16 && hora < 17) return '16:00 - 17:00';
  if (hora >= 17 && hora < 18) return '17:00 - 18:00';
  if (hora >= 18 && hora < 19) return '18:00 - 19:00';
  if (hora >= 19 && hora < 20) return '19:00 - 20:00';
  if (hora >= 20 && hora < 21) return '20:00 - 21:00';
  if (hora >= 21 && hora < 22) return '21:00 - 22:00';
  if (hora >= 22 && hora < 23) return '22:00 - 23:00';
  if (hora >= 23) return '23:00 - 00:00';
  if (hora >= 0 && hora < 1) return '00:00 - 01:00';
  if (hora >= 1 && hora < 2) return '01:00 - 02:00';
  if (hora >= 2 && hora < 3) return '02:00 - 03:00';
  if (hora >= 3 && hora < 4) return '03:00 - 04:00';
  if (hora >= 4 && hora < 5) return '04:00 - 05:00';
  if (hora >= 5 && hora < 6) return '05:00 - 06:00';

  return 'SIN HORA';
}

export function distribuirValorPorRangosHora(
  horaInicio: string,
  horaFinal: string,
  valorTotal: number,
  rangosHoraPermitidos: string[]
): { rangoHora: string; valor: number; minutos: number; porcentaje: number }[] {
  if (!horaInicio || !horaFinal || !valorTotal || valorTotal <= 0) {
    return [];
  }

  const convertirAMinutos = (horaStr: string): number | null => {
    const [h, m] = String(horaStr).split(':').map(Number);

    if (isNaN(h) || isNaN(m)) return null;

    return h * 60 + m;
  };

  const obtenerRangoDesdeHora = (minutoDelDia: number): string => {
    const hora = Math.floor(minutoDelDia / 60) % 24;

    const horaInicioRango = String(hora).padStart(2, '0');
    const horaFinRango = String((hora + 1) % 24).padStart(2, '0');

    return `${horaInicioRango}:00 - ${horaFinRango}:00`;
  };

  let inicio = convertirAMinutos(horaInicio);
  let fin = convertirAMinutos(horaFinal);

  if (inicio === null || fin === null) return [];

  // Si cruza medianoche, por ejemplo 22:00 a 00:00
  if (fin <= inicio) {
    fin += 24 * 60;
  }

  const duracionTotal = fin - inicio;

  if (duracionTotal <= 0) return [];

  const distribucion: {
    rangoHora: string;
    valor: number;
    minutos: number;
    porcentaje: number;
  }[] = [];

  let cursor = inicio;

  while (cursor < fin) {
    const minutoDia = cursor % (24 * 60);
    const rangoHora = obtenerRangoDesdeHora(minutoDia);

    const siguienteCorteHora =
      Math.floor(cursor / 60) * 60 + 60;

    const finTramo = Math.min(fin, siguienteCorteHora);
    const minutosTramo = finTramo - cursor;

    if (
      minutosTramo > 0 &&
      rangosHoraPermitidos.includes(rangoHora)
    ) {
      const porcentaje = minutosTramo / duracionTotal;
      const valor = valorTotal * porcentaje;

      distribucion.push({
        rangoHora,
        valor,
        minutos: minutosTramo,
        porcentaje,
      });
    }

    cursor = finTramo;
  }

  return distribucion;
}