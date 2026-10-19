import { OperacionBase, Registro } from 'app/models/OperacionBase.models';
import { Estado } from 'app/models/Estado';

/** Estructura recibida en aprobaciones/scissor, no la de Scalamin. */
export interface DetalleUtilitario {
  origen_nivel?: string; origen_tipo_labor?: string; origen_labor?: string; origen_ala?: string;
  destino_nivel?: string; destino_tipo_labor?: string; destino_labor?: string; destino_ala?: string;
  observaciones?: string;
}
export type OperacionUtilitario = OperacionBase<DetalleUtilitario>;
export type Agrupacion = 'equipo' | 'dia' | 'semana' | 'mes' | 'ano' | 'guardia' | 'operador';
export type Familia = 'OPERATIVO' | 'MANTENIMIENTO' | 'DEMORA' | 'OTRO';
export interface FilaUtilitario {
  fecha: string; turno: string; equipo: string; guardia: string; operador: string;
  codigo: string; actividad: string; observacion: string; labor: string;
  inicio: string; final: string | null; familia: Familia; horas: number; correctivo: boolean;
}
export interface IndicadorUtilitario {
  label: string; horasTotales: number; horasMtto: number; horasOperativas: number;
  horasCorrectivas: number; fallas: number; equipos: number;
  disponibilidad: number; utilizacion: number; mtbf: number; mttr: number;
  promedioHoras: number; promedioLabores: number; equiposUtilizados: number;
}
export interface PuntoUtilitario { label: string; valor: number; acumulado?: number; }
const normalizar = (s: unknown): string => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
const dividir = (a: number, b: number): number => b > 0 ? a / b : 0;

export function horasRegistro(inicio: string, final: string | null): number {
  const minutos = (s: string): number => {
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return NaN;
    const [h, m, sec = 0] = s.split(':').map(Number);
    return h < 24 && m < 60 && sec < 60 ? h * 60 + m + sec / 60 : NaN;
  };
  if (!inicio || !final) return 0;
  const a = minutos(inicio), b = minutos(final);
  return Number.isFinite(a) && Number.isFinite(b) ? ((b - a + 1440) % 1440) / 60 : 0;
}

/** La API puede entregar registros como JSON, igual que en aprobaciones. */
export function normalizarOperaciones(datos: OperacionUtilitario[]): OperacionUtilitario[] {
  return datos.map(op => {
    let registros: unknown = op.registros;
    if (typeof registros === 'string') {
      try { registros = JSON.parse(registros); } catch { registros = []; }
    }
    return { ...op, registros: Array.isArray(registros)
      ? registros.filter(r => r && typeof r === 'object') as Registro<DetalleUtilitario>[] : [] };
  });
}

export function construirFilas(operaciones: OperacionUtilitario[], estados: Estado[] = []): FilaUtilitario[] {
  const catalogo = new Map(estados.map(e => [String(e.codigo).trim(), e]));
  return normalizarOperaciones(operaciones).flatMap(op => (op.registros || []).map(r => {
    const codigo = String(r.codigo ?? '').trim();
    const e = catalogo.get(codigo);
    const descripcion = normalizar([e?.categoria, e?.tipo_estado, e?.estado_principal].join(' '));
    const estado = normalizar(r.estado);
    const familia: Familia = descripcion.includes('DEMORA') ? 'DEMORA'
      : descripcion.includes('MANTENIMIENTO') ? 'MANTENIMIENTO'
      : descripcion.includes('ACTIVIDADES OPERATIVAS') || normalizar(e?.estado_principal) === 'OPERATIVO' ? 'OPERATIVO'
      : estado.includes('MANTENIMIENTO') ? 'MANTENIMIENTO'
      : estado.includes('DEMORA') ? 'DEMORA' : estado === 'OPERATIVO' ? 'OPERATIVO' : 'OTRO';
    const fecha = String(op.fecha || '').slice(0, 10);
    return {
      fecha, turno: normalizar(op.turno), equipo: String(op.n_equipo || op.equipo || 'Sin equipo').trim(),
      guardia: String(op.guardia || 'Sin guardia').trim(), operador: op.operador || 'Sin operador',
      codigo, familia, actividad: e?.estado_principal || codigo || r.estado || 'Sin actividad',
      observacion: String(r.operacion?.observaciones || '').trim() || 'Sin observación',
      // LABOR no existe como campo único: se usa la labor de origen, una por registro.
      labor: String(r.operacion?.origen_labor || '').trim(),
      inicio: r.hora_inicio, final: r.hora_final, horas: horasRegistro(r.hora_inicio, r.hora_final),
      // Mismo criterio del builder de sostenimiento; no contar preventivos como fallas.
      correctivo: familia === 'MANTENIMIENTO' &&
        (codigo === '303' || /\bCORRECTIV[OA]S?\b|\bNO PROGRAMAD[OA]S?\b/.test(descripcion)),
    };
  }));
}

export function agrupar<T>(filas: T[], clave: (f: T) => string): Map<string, T[]> {
  const grupos = new Map<string, T[]>();
  for (const f of filas) { const key = clave(f); const g = grupos.get(key) || []; g.push(f); grupos.set(key, g); }
  return grupos;
}

/** WEEKNUM(fecha, 2), como OrdenSemana del PB: lunes; semana 1 contiene el 1 de enero. */
export function claveGrupo(f: FilaUtilitario, por: Agrupacion): string {
  if (por === 'dia') return f.fecha || 'Sin fecha';
  if (por === 'mes') return f.fecha.slice(0, 7) || 'Sin mes';
  if (por === 'ano') return f.fecha.slice(0, 4) || 'Sin año';
  if (por === 'semana') {
    const fecha = new Date(`${f.fecha}T00:00:00Z`);
    if (Number.isNaN(fecha.getTime())) return 'Sin semana';
    const inicio = new Date(Date.UTC(fecha.getUTCFullYear(), 0, 1));
    const offset = (inicio.getUTCDay() + 6) % 7;
    const semana = Math.floor(((fecha.getTime() - inicio.getTime()) / 86400000 + offset) / 7) + 1;
    return `${fecha.getUTCFullYear()}-S${String(semana).padStart(2, '0')}`;
  }
  return f[por];
}

export function resumenUtilitario(filas: FilaUtilitario[], label = 'Total'): IndicadorUtilitario {
  const total = filas.reduce((s, f) => s + f.horas, 0);
  const mtto = filas.filter(f => f.familia === 'MANTENIMIENTO').reduce((s, f) => s + f.horas, 0);
  const operativas = filas.filter(f => f.familia === 'OPERATIVO').reduce((s, f) => s + f.horas, 0);
  const correctivas = filas.filter(f => f.correctivo).reduce((s, f) => s + f.horas, 0);
  const fallas = filas.filter(f => f.correctivo && f.horas > 0).length;
  const horasGrupos = agrupar(filas, f => JSON.stringify([f.fecha, f.equipo, f.guardia]));
  const laborGrupos = agrupar(filas, f => JSON.stringify([f.fecha, f.equipo]));
  const turnoGrupos = agrupar(filas, f => JSON.stringify([f.fecha, f.turno]));
  const excluidos = new Set(['308', '405', '408', '201', '202']);
  const equiposTurnos = [...turnoGrupos.values()].map(g => new Set(g
    .filter(f => f.horas > 0 && !excluidos.has(f.codigo)).map(f => f.equipo)).size);
  return {
    label, horasTotales: total, horasMtto: mtto, horasOperativas: operativas,
    horasCorrectivas: correctivas, fallas, equipos: new Set(filas.map(f => f.equipo)).size,
    disponibilidad: dividir(total - mtto, total) * 100,
    utilizacion: dividir(operativas, total - mtto) * 100,
    // DAX.tmdl: ausencia de fallas usa denominador 1 en MTBF y alternativo 0 en MTTR.
    mtbf: dividir(total - correctivas, fallas || 1), mttr: dividir(correctivas, fallas),
    promedioHoras: dividir(operativas, horasGrupos.size),
    promedioLabores: dividir(filas.filter(f => !!f.labor).length, laborGrupos.size),
    equiposUtilizados: dividir(equiposTurnos.reduce((s, n) => s + n, 0), turnoGrupos.size),
  };
}

export function indicadoresUtilitario(filas: FilaUtilitario[], por: Agrupacion): IndicadorUtilitario[] {
  return [...agrupar(filas, f => claveGrupo(f, por))].sort(([a], [b]) => a.localeCompare(b))
    .map(([key, grupo]) => resumenUtilitario(grupo, key));
}

export function paretoUtilitario(filas: FilaUtilitario[], mantenimiento: boolean, detalle = false): PuntoUtilitario[] {
  const validas = filas.filter(f => f.horas > 0 && f.familia === (mantenimiento ? 'MANTENIMIENTO' : 'DEMORA'));
  const puntos = [...agrupar(validas, f => detalle ? f.observacion : f.actividad)]
    .map(([label, g]) => ({ label, valor: g.reduce((s, f) => s + f.horas, 0) }))
    .sort((a, b) => b.valor - a.valor || a.label.localeCompare(b.label));
  const total = puntos.reduce((s, p) => s + p.valor, 0);
  let acumulado = 0;
  return puntos.map(p => {
    acumulado += p.valor;
    // ParetoND% y ParetoObservacion usan rango denso: empates comparten acumulado.
    const denso = mantenimiento && !detalle || !mantenimiento && detalle;
    const horas = denso ? puntos.filter(q => q.valor >= p.valor).reduce((s, q) => s + q.valor, 0) : acumulado;
    return { ...p, acumulado: dividir(horas, total) * 100 };
  });
}

