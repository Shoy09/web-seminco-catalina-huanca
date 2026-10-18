import { OperacionBaseScalamin } from 'app/models/OperacionBase.models';
import { Estado } from 'app/models/Estado';
import { obtenerPeriodo } from 'app/utils/fecha-utils';

export type Agrupacion = 'equipo' | 'dia' | 'semana' | 'mes' | 'ano' | 'guardia' | 'operador';
export interface IndicadorScalamin {
  label: string;
  horasTotales: number;
  horasMtto: number;
  horasOperativas: number;
  fallas: number;
  equipos: number;
  disponibilidad: number | null;
  utilizacion: number | null;
  mtbf: number | null;
  mttr: number | null;
}
export interface PuntoScalamin { label: string; valor: number; acumulado?: number; }

export function horasRegistro(inicio: string, final: string | null): number {
  const minutos = (valor: string): number => {
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(valor)) return NaN;
    const [h, m, s = 0] = valor.split(':').map(Number);
    return h < 24 && m < 60 && s < 60 ? h * 60 + m + s / 60 : NaN;
  };
  if (!inicio || !final) return 0;
  const a = minutos(inicio), b = minutos(final);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return ((b - a + 1440) % 1440) / 60;
}

const normalizar = (s: string) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
const dividir = (a: number, b: number): number | null => b > 0 ? a / b : null;

function clasificar(estado: string, codigo: string, estados: Estado[]): string {
  const catalogado = estados.find(e => String(e.codigo).trim() === String(codigo).trim());
  const tipo = normalizar(`${estado} ${catalogado?.tipo_estado || ''} ${catalogado?.categoria || ''} ${catalogado?.estado_principal || ''}`);
  if (tipo.includes('MANTENIMIENTO')) return 'MANTENIMIENTO';
  if (tipo.includes('DEMORA')) return 'DEMORA';
  if (normalizar(catalogado?.categoria || '').includes('ACTIVIDADES OPERATIVAS') || normalizar(catalogado?.estado_principal || '') === 'OPERATIVO') return 'OPERATIVO';
  return normalizar(estado);
}

/** Agrupa horas antes de calcular razones; evita promediar porcentajes. */
export function indicadoresScalamin(operaciones: OperacionBaseScalamin[], por: Agrupacion, estados: Estado[] = []): IndicadorScalamin[] {
  const grupos = new Map<string, { label: string; total: number; mtto: number; operativo: number; fallas: number; equipos: Set<string> }>();
  for (const op of operaciones) {
    const fecha = String(op.fecha || '').slice(0, 10);
    const periodo = por === 'dia' || por === 'semana' || por === 'mes'
      ? obtenerPeriodo(fecha, por === 'dia' ? 'DIA' : por === 'semana' ? 'SEMANA' : 'MES') : null;
    const key = periodo?.key ?? (por === 'ano' ? fecha.slice(0, 4) : por === 'equipo' ? op.n_equipo : por === 'guardia' ? op.guardia : op.operador) ?? '';
    const label = periodo?.label || key || 'Sin asignar';
    let g = grupos.get(key);
    if (!g) { g = { label, total: 0, mtto: 0, operativo: 0, fallas: 0, equipos: new Set() }; grupos.set(key, g); }
    if (op.n_equipo) g.equipos.add(op.n_equipo);
    for (const r of op.registros || []) {
      const horas = horasRegistro(r.hora_inicio, r.hora_final);
      g.total += horas;
      const estado = clasificar(r.estado, r.codigo, estados);
      if (estado === 'MANTENIMIENTO') { g.mtto += horas; if (horas > 0) g.fallas++; }
      if (estado === 'OPERATIVO') g.operativo += horas;
    }
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, g]) => ({
    label: g.label, horasTotales: g.total, horasMtto: g.mtto, horasOperativas: g.operativo,
    fallas: g.fallas, equipos: g.equipos.size,
    disponibilidad: g.total > 0 ? (g.total - g.mtto) / g.total * 100 : null,
    utilizacion: g.total > g.mtto ? g.operativo / (g.total - g.mtto) * 100 : null,
    mtbf: dividir(g.total - g.mtto, g.fallas), mttr: dividir(g.mtto, g.fallas),
  }));
}

export function paretoScalamin(operaciones: OperacionBaseScalamin[], estados: Estado[], mantenimiento: boolean, detalle = false): PuntoScalamin[] {
  const catalogo = new Map(estados.map(e => [String(e.codigo).trim(), e]));
  const grupos = new Map<string, number>();
  for (const op of operaciones) for (const r of op.registros || []) {
    const estado = clasificar(r.estado, r.codigo, estados);
    if (mantenimiento ? estado !== 'MANTENIMIENTO' : estado !== 'DEMORA') continue;
    const catalogado = catalogo.get(String(r.codigo).trim());
    const label = detalle ? r.operacion?.observaciones?.trim() || 'Sin observación'
      : catalogado?.estado_principal || r.codigo || r.estado;
    const horas = horasRegistro(r.hora_inicio, r.hora_final);
    if (horas > 0) grupos.set(label, (grupos.get(label) || 0) + horas);
  }
  const puntos = [...grupos].map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  const total = puntos.reduce((s, p) => s + p.valor, 0);
  let acumulado = 0;
  return puntos.map(p => ({ ...p, acumulado: (acumulado += p.valor) / total * 100 }));
}

export function ganttScalamin(operaciones: OperacionBaseScalamin[], estados: Estado[]) {
  const catalogo = new Map(estados.map(e => [String(e.codigo).trim(), e]));
  const grupos = new Map<string, { fecha: string; turno: string; groups: { equipoCodigo: string; rows: { estado_equipo: string; tasks: object[] }[] }[] }>();
  for (const op of operaciones) {
    const key = `${op.fecha}|${op.turno}`;
    let grupo = grupos.get(key);
    if (!grupo) { grupo = { fecha: op.fecha, turno: op.turno, groups: [] }; grupos.set(key, grupo); }
    const tasks = (op.registros || []).filter(r => horasRegistro(r.hora_inicio, r.hora_final) > 0).map(r => ({
      start: r.hora_inicio, end: r.hora_final, estado: normalizar(r.estado),
      description: catalogo.get(String(r.codigo).trim())?.estado_principal || r.codigo,
      tipo_estado: catalogo.get(String(r.codigo).trim())?.tipo_estado || '',
    }));
    if (tasks.length) grupo.groups.push({ equipoCodigo: `${op.n_equipo} · ${op.operador || 'Sin operador'}`, rows: [{ estado_equipo: op.equipo, tasks }] });
  }
  return [...grupos.values()].filter(g => g.groups.length).sort((a, b) => a.fecha.localeCompare(b.fecha));
}
