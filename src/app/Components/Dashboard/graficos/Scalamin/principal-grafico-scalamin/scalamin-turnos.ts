import { OperacionBaseScalamin } from 'app/models/OperacionBase.models';

export interface PuntoTurnoScalamin {
  x: number;
  y: string;
  grupo: string;
  codigo: string;
}

export interface AnalisisTurnoScalamin {
  turno: 'día' | 'noche';
  puntos: PuntoTurnoScalamin[];
}

/** Mismos códigos, agrupación por fecha y horario que el análisis de sostenimiento. */
export function construirAnalisisTurnosScalamin(
  operaciones: OperacionBaseScalamin[], turnoAplicado = '',
): AnalisisTurnoScalamin[] {
  const codigos = new Set(['101', '102', '103', '106', '111', '112', '120', '201']);
  const normalizar = (turno: string) => turno.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  const solicitado = normalizar(turnoAplicado);
  const resultado: AnalisisTurnoScalamin[] = [
    { turno: 'día', puntos: [] }, { turno: 'noche', puntos: [] },
  ];
  for (const op of operaciones) {
    const turno = normalizar(op.turno || '');
    if (turno !== 'DIA' && turno !== 'NOCHE') continue;
    const grupo = resultado[turno === 'DIA' ? 0 : 1];
    for (const registro of op.registros || []) {
      const codigo = String(registro.codigo || '').trim();
      if (!codigos.has(codigo) || !/^\d{2}:\d{2}(:\d{2})?$/.test(registro.hora_inicio || '')) continue;
      const [hora, minuto, segundo = 0] = registro.hora_inicio.split(':').map(Number);
      if (hora > 23 || minuto > 59 || segundo > 59) continue;
      let decimal = hora + minuto / 60;
      if (turno === 'NOCHE' && decimal < 7) decimal += 24;
      grupo.puntos.push({ x: decimal, y: String(op.n_equipo || 'SIN_EQUIPO').trim(), grupo: op.fecha || 'SIN_FECHA', codigo });
    }
  }
  return resultado.filter(g => !solicitado || normalizar(g.turno) === solicitado);
}
