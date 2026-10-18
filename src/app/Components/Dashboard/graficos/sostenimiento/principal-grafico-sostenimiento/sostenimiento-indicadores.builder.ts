import { OperacionBaseSostenimiento } from '../../../../../models/OperacionBase.models';
import { OperacionSostenimiento, PernoSostenimiento } from '../../../../../models/OperacionSostenimiento';
import { Estado } from '../../../../../models/Estado';
import { PlanProduccion } from '../../../../../models/plan_produccion.model';
import { obtenerSemanaISO } from '../../../../../utils/fecha-utils';
import { IndicadorGrafico, IndicadorPagina } from './sostenimiento-indicadores.model';

type Familia = 'operativa' | 'mantenimiento' | 'demoraOperativa' | 'demoraNoOperativa' | 'otra';
interface Fila {
  fecha: string; turno: string; equipo: string; guardia: string; operador: string;
  codigo: string; actividad: string; observacion: string; familia: Familia;
  horas: number; mantenimiento: number; operativas: number; correctivo: number; fallas: number;
  pernos: number; metros: number; labor: string; minado: string; tipos: PernoSostenimiento[];
}
type Medida = 'disponibilidad' | 'utilizacion' | 'rendimiento' | 'produccion' | 'horas';
const numero = (valor: unknown): number => Number.isFinite(Number(valor)) ? Number(valor) : 0;
const normalizar = (valor: string): string => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
const dividir = (a: number, b: number): number => b === 0 ? 0 : a / b;
const sumar = (filas: Fila[], campo: 'horas' | 'mantenimiento' | 'operativas' | 'correctivo' | 'fallas' | 'pernos' | 'metros'): number => filas.reduce((s, fila) => s + fila[campo], 0);
const DESCRIPCIONES: Record<string, string> = {
  '201': 'Falta de operador', '202': 'Mantenimiento preventivo de labor', '203': 'Ingreso / salida',
  '204': 'Charla', '205': 'Traslado al equipo', '206': 'Inspección de equipo', '207': 'Refrigerio',
  '208': 'Traslado de equipo', '209': 'Falta de labor', '210': 'Falta de servicios',
  '211': 'Instalación de equipo', '212': 'Apoyo en servicios mineros', '213': 'Falta de aceros',
  '214': 'Falta de ventilación', '215': 'Trabajos varios', '216': 'Accidente de equipo',
  '217': 'Recuperación de aceros', '301': 'Mantenimiento inicial / final', '302': 'Mantenimiento programado',
  '303': 'Mantenimiento correctivo', '306': 'Mantenimiento varios', '307': 'Mantenimiento adicional',
};

function duracion(inicio: string, fin: string | null): number {
  const minutos = (hora: string): number => {
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(hora)) return NaN;
    const [h, m, s = 0] = hora.split(':').map(Number);
    return h < 24 && m < 60 && s < 60 ? h * 60 + m + s / 60 : NaN;
  };
  if (!inicio || !fin) return 0;
  const a = minutos(inicio), b = minutos(fin);
  return Number.isFinite(a) && Number.isFinite(b) ? ((b - a + 1440) % 1440) / 60 : 0;
}

function agrupar<T>(filas: T[], clave: (fila: T) => string): Map<string, T[]> {
  const grupos = new Map<string, T[]>();
  for (const fila of filas) {
    const key = clave(fila);
    const grupo = grupos.get(key) || [];
    grupo.push(fila);
    grupos.set(key, grupo);
  }
  return grupos;
}

function pernosOperacion(op: OperacionSostenimiento): PernoSostenimiento[] {
  const anidados = op.perno ? Array.isArray(op.perno) ? op.perno : [op.perno] : [];
  return anidados.some(p => p && (p.tipo_pernos?.trim() || numero(p.log_pernos) > 0 || numero(p.n_pernos_instalados) > 0))
    ? anidados.filter(Boolean) : [{ tipo_pernos: op.tipo_pernos, log_pernos: op.log_pernos, n_pernos_instalados: op.n_pernos_instalados }];
}

function familiaRegistro(estado: string, codigo: string, catalogado?: Estado): Familia {
  const categoria = normalizar(catalogado?.categoria || '');
  const principal = normalizar(catalogado?.estado_principal || '');
  const tipo = normalizar(catalogado?.tipo_estado || '');
  const texto = `${categoria} ${principal} ${tipo}`;
  if (texto.includes('DEMORAS NO OPERATIVAS')) return 'demoraNoOperativa';
  if (texto.includes('DEMORAS OPERATIVAS')) return 'demoraOperativa';
  if (`${categoria} ${tipo}`.includes('MANTENIMIENTO') || principal === 'MANTENIMIENTO') return 'mantenimiento';
  if (`${categoria} ${tipo}`.includes('ACTIVIDADES OPERATIVAS') || principal === 'OPERATIVO') return 'operativa';
  if (normalizar(estado) === 'MANTENIMIENTO') return 'mantenimiento';
  if (normalizar(estado) === 'OPERATIVO') return 'operativa';
  if (normalizar(estado) === 'DEMORA') {
    return ['209', '210', '212', '213', '214', '215', '216', '217'].includes(codigo) ? 'demoraNoOperativa' : 'demoraOperativa';
  }
  return 'otra';
}

function construirFilas(operaciones: OperacionBaseSostenimiento[], planes: PlanProduccion[], estados: Estado[]): Fila[] {
  const catalogo = new Map(estados.map(e => [String(e.codigo).trim(), e]));
  const planesLabor = new Map(planes.map(p => [[p.tipo_labor, p.labor, p.ala].map(v => String(v || '').trim()).join('|'), p]));
  return operaciones.flatMap(op => (op.registros || []).map(registro => {
    const codigo = String(registro.codigo || '').trim();
    const catalogado = catalogo.get(codigo);
    const familia = familiaRegistro(registro.estado, codigo, catalogado);
    const horas = duracion(registro.hora_inicio, registro.hora_final);
    const datos = registro.operacion || {};
    const tipos = pernosOperacion(datos);
    const labor = [datos.tipo_labor, datos.labor, datos.ala].map(v => String(v || '').trim());
    const descripcionMantenimiento = normalizar([
      catalogado?.estado_principal, catalogado?.tipo_estado, catalogado?.categoria,
    ].filter(Boolean).join(' '));
    const correctivo = familia === 'mantenimiento' && (codigo === '303' || /\bCORRECTIV[OA]S?\b|\bNO PROGRAMAD[OA]S?\b/.test(descripcionMantenimiento));
    return {
      fecha: String(op.fecha || '').slice(0, 10), turno: op.turno || 'SIN_TURNO',
      equipo: String(op.n_equipo || op.equipo || 'SIN_EQUIPO').trim(), guardia: String(op.seccion || op.guardia || 'SIN_GUARDIA').trim(),
      operador: op.operador || 'SIN_OPERADOR', codigo,
      actividad: catalogado?.estado_principal || DESCRIPCIONES[codigo] || `Actividad ${codigo}`,
      observacion: String(datos.observaciones || '').trim() || 'SIN OBSERVACIÓN', familia,
      horas, mantenimiento: familia === 'mantenimiento' ? horas : 0,
      operativas: familia === 'operativa' ? horas : 0,
      correctivo: correctivo ? horas : 0, fallas: correctivo && horas > 0 ? 1 : 0,
      pernos: tipos.reduce((s, p) => s + numero(p.n_pernos_instalados), 0),
      metros: tipos.reduce((s, p) => s + numero(p.n_pernos_instalados) * numero(p.log_pernos) * 0.3048, 0),
      labor: datos.labor ? labor.join('') : '', minado: String(planesLabor.get(labor.join('|'))?.minado_tipo || 'SIN_PLAN'), tipos,
    };
  }));
}

function disponibilidad(filas: Fila[]): number { return dividir(sumar(filas, 'horas') - sumar(filas, 'mantenimiento'), sumar(filas, 'horas')) * 100; }
function utilizacion(filas: Fila[]): number { return dividir(sumar(filas, 'operativas'), sumar(filas, 'horas') - sumar(filas, 'mantenimiento')) * 100; }
function rendimiento(filas: Fila[]): number { return dividir(sumar(filas, 'pernos'), sumar(filas, 'operativas')); }
function mtbf(filas: Fila[]): number { return dividir(sumar(filas, 'horas') - sumar(filas, 'correctivo'), sumar(filas, 'fallas') || 1); }
function mttr(filas: Fila[]): number { return dividir(sumar(filas, 'correctivo'), sumar(filas, 'fallas')); }

export function construirRankingOperadoresSostenimiento(operaciones: OperacionBaseSostenimiento[], estados: Estado[] = []) {
  const filas = construirFilas(operaciones, [], estados);
  return [...agrupar(filas, f => JSON.stringify([f.operador, f.turno])).values()].map(grupo => ({
    operador: grupo[0].operador, turno: grupo[0].turno,
    pernos_instalados: sumar(grupo, 'pernos'), horas_operativas: sumar(grupo, 'operativas'),
    rendimiento: rendimiento(grupo),
  }));
}
function promedioHoras(filas: Fila[]): number {
  const grupos = [...agrupar(filas, f => JSON.stringify([f.fecha, f.equipo, f.guardia])).values()];
  return dividir(grupos.reduce((s, g) => s + sumar(g, 'operativas'), 0), grupos.length);
}
function promedioFrentes(filas: Fila[], porGuardia: boolean): number {
  const grupos = [...agrupar(filas, f => JSON.stringify([f.fecha, porGuardia ? f.guardia : f.equipo])).values()];
  return dividir(grupos.reduce((s, g) => s + g.filter(f => !!f.labor).length, 0), grupos.length);
}
function semana(fila: Fila): string {
  const fecha = new Date(`${fila.fecha}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return 'SIN_SEMANA';
  const iso = obtenerSemanaISO(fecha);
  return `${iso.year}-S${String(iso.week).padStart(2, '0')}`;
}

function serie(titulo: string, filas: Fila[], clave: (fila: Fila) => string, nombre: string, calcular: (grupo: Fila[]) => number, unidad: string, horizontal = false): IndicadorGrafico {
  const grupos = agrupar(filas, clave);
  const categorias = [...grupos.keys()].sort();
  return { titulo, tipo: 'bar', unidad, horizontal, categorias, series: [{ nombre, valores: categorias.map(c => calcular(grupos.get(c)!)) }] };
}

const OBJETIVOS_MES = [17056, 15230, 16186, 17570, 16699, 16349, 16962, 16888, 17596, 17562, 16438, 16970];
function objetivo(fecha: string, diario: boolean): number {
  const [anio, mes] = fecha.split('-').map(Number);
  const mensual = OBJETIVOS_MES[mes - 1] || 0;
  return diario ? dividir(mensual, new Date(anio, mes, 0).getDate()) : mensual;
}

function combo(titulo: string, filas: Fila[], clave: (fila: Fila) => string, medida: Medida, periodo?: 'dia' | 'mes'): IndicadorGrafico {
  const grupos = agrupar(filas, clave);
  const categorias = [...grupos.keys()].sort();
  const datos = categorias.map(c => grupos.get(c)!);
  const valores = (campo: Parameters<typeof sumar>[1]) => datos.map(g => sumar(g, campo));
  if (medida === 'disponibilidad' || medida === 'utilizacion') return {
    titulo, tipo: 'combo', categorias, unidad: 'h', unidadSecundaria: '%', series: [
      { nombre: medida === 'disponibilidad' ? 'Horas registradas' : 'Horas operativas', tipo: 'bar', valores: valores(medida === 'disponibilidad' ? 'horas' : 'operativas') },
      { nombre: 'Horas de mantenimiento', tipo: 'bar', valores: valores('mantenimiento') },
      { nombre: medida === 'disponibilidad' ? 'Disponibilidad' : 'Utilización', tipo: 'line', ejeSecundario: true, valores: datos.map(medida === 'disponibilidad' ? disponibilidad : utilizacion) },
    ],
  };
  if (medida === 'rendimiento') return serie(titulo, filas, clave, 'Rendimiento', rendimiento, 'pernos/h');
  if (medida === 'produccion') return {
    titulo, tipo: periodo ? 'combo' : 'bar', categorias, unidad: 'pernos', series: [
      { nombre: 'Pernos instalados', tipo: 'bar', valores: valores('pernos') },
      ...(periodo ? [{ nombre: 'Objetivo del modelo PB', tipo: 'line' as const, valores: categorias.map(c => objetivo(c, periodo === 'dia')) }] : []),
    ],
  };
  return serie(titulo, filas, clave, 'Horas operativas promedio', promedioHoras, 'h');
}

function pareto(titulo: string, filas: Fila[], clave: (fila: Fila) => string, empates: 'denso' | 'nombre' | 'tolerancia' = 'nombre', top?: number, minimo?: number): IndicadorGrafico {
  let puntos = [...agrupar(filas, clave)].map(([nombre, grupo]) => ({ nombre, horas: sumar(grupo, 'horas') }));
  puntos = puntos.filter(p => minimo === undefined ? p.horas > 0 : p.horas > minimo)
    .sort((a, b) => b.horas - a.horas || a.nombre.localeCompare(b.nombre, 'es'));
  const total = puntos.reduce((s, p) => s + p.horas, 0);
  const porcentajes = puntos.map(p => dividir(puntos.filter(q =>
    empates === 'denso' ? q.horas >= p.horas : q.horas > p.horas ||
      ((empates === 'tolerancia' ? Math.abs(q.horas - p.horas) < 1e-6 : q.horas === p.horas) && q.nombre.localeCompare(p.nombre, 'es') <= 0),
  ).reduce((s, q) => s + q.horas, 0), total) * 100);
  return { titulo, tipo: 'pareto', unidad: 'h', categorias: puntos.slice(0, top).map(p => p.nombre), series: [
    { nombre: 'Horas', tipo: 'bar', valores: puntos.slice(0, top).map(p => p.horas) },
    { nombre: 'Acumulado', tipo: 'line', valores: porcentajes.slice(0, top) },
  ] };
}

function gauge(titulo: string, valor: number, unidad: string): IndicadorGrafico {
  return { titulo, tipo: 'gauge', valor, unidad, maximo: unidad === '%' ? 100 : Math.max(1, valor * 1.2) };
}

export function obtenerHorasHorometroSostenimiento(op: OperacionBaseSostenimiento, tipo: string): number {
  let datos: unknown = op.horometros;
  if (typeof datos === 'string') { try { datos = JSON.parse(datos); } catch { return 0; } }
  const lectura = (datos as Record<string, { inicio?: unknown; final?: unknown }> | null)?.[tipo];
  if (!lectura || lectura.inicio == null || lectura.final == null) return 0;
  if (lectura.inicio === '' || lectura.final === '') return 0;
  const inicio = Number(lectura.inicio);
  const final = Number(lectura.final);
  if (!Number.isFinite(inicio) || !Number.isFinite(final)) return 0;
  // Conservar negativos para que las lecturas incorrectas sean visibles.
  return final - inicio;
}

function scatter(filas: Fila[], turno: 'día' | 'noche'): IndicadorGrafico {
  const codigos = new Set(['101', '102', '103', '106', '111', '112', '120', '201']);
  const puntos = filas.filter(f => normalizar(f.turno) === (turno === 'día' ? 'DIA' : 'NOCHE') && codigos.has(f.codigo));
  // Las horas de inicio se adjuntan en el constructor, sin exigir que el registro esté cerrado.
  return { titulo: `Análisis de turnos — ${turno}`, tipo: 'scatter', unidad: turno, categorias: [...new Set(puntos.map(p => p.equipo))].sort(), puntos: [] };
}

/** Razones de sumas según TMDL. El catálogo clasifica horas; no se imputan horas de turno ni mantenimiento ficticio. */
export function construirIndicadoresSostenimiento(operaciones: OperacionBaseSostenimiento[], planes: PlanProduccion[] = [], estados: Estado[] = []): IndicadorPagina[] {
  const filas = construirFilas(operaciones, planes, estados);
  const mantenimiento = filas.filter(f => f.familia === 'mantenimiento');
  const demoras = filas.filter(f => f.familia === 'demoraOperativa' || f.familia === 'demoraNoOperativa');
  const guardia = (f: Fila) => f.guardia;
  const periodos: [string, (f: Fila) => string][] = [['por equipo', f => f.equipo], ['diaria', f => f.fecha], ['semanal', semana], ['mensual', f => f.fecha.slice(0, 7)]];
  const principales = (nombre: string, medida: Medida) => periodos.map(([periodo, key]) => combo(`${nombre} ${periodo}`, filas, key, medida));
  const tablaMtto = (nombre: 'MTBF' | 'MTTR'): IndicadorGrafico => {
    const grupos = agrupar(filas, f => f.equipo);
    return {
      titulo: `${nombre} por equipo`, tipo: 'table',
      columnas: ['Equipo', 'Fallas', ...(nombre === 'MTTR' ? ['Horas correctivas'] : []), `${nombre} (h)`],
      filas: [...grupos.keys()].sort().map(e => ({
        Equipo: e, Fallas: sumar(grupos.get(e)!, 'fallas'),
        ...(nombre === 'MTTR' ? { 'Horas correctivas': sumar(grupos.get(e)!, 'correctivo') } : {}),
        [`${nombre} (h)`]: (nombre === 'MTBF' ? mtbf : mttr)(grupos.get(e)!),
      })),
    };
  };
  const paginas: IndicadorPagina[] = [
    { nombre: 'Disponibilidad', descripcion: 'Horas disponibles respecto de las horas registradas.', graficos: [
      ...principales('Disponibilidad', 'disponibilidad'),
      serie('Disponibilidad por guardia', filas, guardia, 'Disponibilidad', disponibilidad, '%'),
      pareto('Mantenimiento por actividad', mantenimiento, f => f.actividad, 'denso'),
    ] },
    { nombre: 'Utilización', descripcion: 'Horas operativas respecto de las horas disponibles.', graficos: [
      ...principales('Utilización', 'utilizacion'),
      serie('Utilización por guardia', filas, guardia, 'Utilización', utilizacion, '%'),
      pareto('Demoras operativas por actividad', filas.filter(f => f.familia === 'demoraOperativa'), f => f.actividad, 'tolerancia', 10),
    ] },
    { nombre: 'Rendimiento', descripcion: 'Pernos instalados por hora operativa.', graficos: [
      ...principales('Rendimiento', 'rendimiento'),
      serie('Rendimiento por guardia', filas, guardia, 'Rendimiento', rendimiento, 'pernos/h'),
      gauge('Rendimiento global', rendimiento(filas), 'pernos/h'),
    ] },
    { nombre: 'Pareto Disponibilidad', descripcion: 'Mantenimiento no programado agrupado por observación.', graficos: [
      pareto('Mantenimiento no programado por observación', mantenimiento.filter(f => f.fallas > 0), f => f.observacion, 'nombre'),
    ] },
    { nombre: 'Pareto Utilización', descripcion: 'Demoras por observación con más de una hora, según el filtro del reporte.', graficos: [
      pareto('Demoras por observación', demoras, f => f.observacion, 'denso', undefined, 1),
    ] },
    { nombre: 'Ranking', descripcion: 'Indicadores consolidados por operador, equipo y guardia.', graficos: [
      serie('Utilización por operador', filas, f => f.operador, 'Utilización', utilizacion, '%', true),
      serie('Rendimiento por operador y equipo', filas, f => `${f.operador} · ${f.equipo}`, 'Rendimiento', rendimiento, 'pernos/h', true),
      serie('Disponibilidad por guardia', filas, guardia, 'Disponibilidad', disponibilidad, '%', true),
      serie('Utilización por guardia', filas, guardia, 'Utilización', utilizacion, '%', true),
      serie('Rendimiento por guardia', filas, guardia, 'Rendimiento', rendimiento, 'pernos/h', true),
      serie('Frentes promedio por guardia', filas, guardia, 'Frentes', g => promedioFrentes(g, true), 'frentes', true),
      serie('Pernos instalados por operador', filas, f => f.operador, 'Pernos', g => sumar(g, 'pernos'), 'pernos', true),
    ] },
    { nombre: 'MTBF-MTTR', descripcion: 'Tiempo entre fallas y tiempo de reparación calculados sobre las sumas del período.', graficos: [
      tablaMtto('MTBF'),
      { ...serie('MTBF semanal', filas, semana, 'MTBF', mtbf, 'h'), tipo: 'line' },
      { ...serie('MTBF mensual', filas, f => f.fecha.slice(0, 7), 'MTBF', mtbf, 'h'), tipo: 'line' },
      gauge('MTBF global', mtbf(filas), 'h'), gauge('MTTR global', mttr(filas), 'h'),
      { ...serie('MTTR mensual', filas, f => f.fecha.slice(0, 7), 'MTTR', mttr, 'h'), tipo: 'line' },
      { ...serie('MTTR semanal', filas, semana, 'MTTR', mttr, 'h'), tipo: 'line' }, tablaMtto('MTTR'),
    ] },
    { nombre: 'Producción', descripcion: 'Pernos instalados; objetivos diarios y mensuales definidos en el modelo PB proporcionado.', graficos: [
      combo('Pernos instalados por equipo', filas, f => f.equipo, 'produccion'),
      combo('Pernos instalados por día', filas, f => f.fecha, 'produccion', 'dia'),
      combo('Pernos instalados por semana', filas, semana, 'produccion'),
      combo('Pernos instalados por mes', filas, f => f.fecha.slice(0, 7), 'produccion', 'mes'),
      serie('Pernos instalados por guardia', filas, guardia, 'Pernos', g => sumar(g, 'pernos'), 'pernos'),
      { ...gauge('Pernos instalados', sumar(filas, 'pernos'), 'pernos'), maximo: Math.max(201506, sumar(filas, 'pernos')) },
      gauge('Metros de pernos instalados', sumar(filas, 'metros'), 'm'),
      gauge('Horas de percusión', operaciones.reduce((s, op) => s + obtenerHorasHorometroSostenimiento(op, 'percusion'), 0), 'h'),
      gauge('Rendimiento de sostenimiento', rendimiento(filas), 'pernos/h'),
    ] },
    { nombre: 'HORAS OPERATIVAS', descripcion: 'Promedio de horas operativas agrupadas por fecha, equipo y guardia.', graficos: [
      combo('Promedio de horas operativas por día', filas, f => f.fecha, 'horas'),
      combo('Promedio de horas operativas por semana', filas, semana, 'horas'),
      combo('Promedio de horas operativas por mes', filas, f => f.fecha.slice(0, 7), 'horas'),
    ] },
  ];
  agregarDetalles(paginas, filas, operaciones);
  return paginas;
}

function agregarDetalles(paginas: IndicadorPagina[], filas: Fila[], operaciones: OperacionBaseSostenimiento[]): void {
  const agregar = (pagina: string, ...graficos: IndicadorGrafico[]) => paginas.find(p => p.nombre === pagina)!.graficos.push(...graficos);
  // Conserva la distribución por fecha y equipo de los gráficos de turnos de sostenimiento.
  for (const turno of ['día', 'noche'] as const) {
    const grafico = scatter(filas, turno);
    const codigos = new Set(['101', '102', '103', '106', '111', '112', '120', '201']);
    grafico.puntos = operaciones.filter(op => normalizar(op.turno) === (turno === 'día' ? 'DIA' : 'NOCHE')).flatMap(op => (op.registros || []).flatMap(r => {
      if (!codigos.has(String(r.codigo).trim()) || !/^\d{2}:\d{2}(:\d{2})?$/.test(r.hora_inicio || '')) return [];
      const [h, m, s = 0] = r.hora_inicio.split(':').map(Number);
      if (h > 23 || m > 59 || s > 59) return [];
      const x = h + m / 60 + (turno === 'noche' && h < 7 ? 24 : 0);
      return [{ x, y: String(op.n_equipo || op.equipo || 'SIN_EQUIPO'), grupo: String(op.fecha).slice(0, 10), detalle: `Código: ${r.codigo}` }];
    }));
    grafico.categorias = [...new Set(grafico.puntos.map(p => p.y))].sort();
    agregar('Utilización', grafico);
  }
  const tipos = filas.flatMap(f => f.tipos.map(p => ({ ...f, pernos: numero(p.n_pernos_instalados), tipo: p.tipo_pernos || 'SIN_TIPO' }))).filter(f => f.pernos > 0);
  const porEquipo = agrupar(tipos, f => f.equipo);
  const categorias = [...porEquipo.keys()].sort();
  const nombresTipos = [...new Set(tipos.map(f => f.tipo))];
  const fechas = [...new Set(filas.map(f => f.fecha))].sort();
  const turnos = [...new Set(filas.map(f => f.turno))].sort();
  const pie = (titulo: string, datos: Fila[], clave: (f: Fila) => string): IndicadorGrafico => ({ ...serie(titulo, datos, clave, 'Pernos', g => sumar(g, 'pernos'), 'pernos'), tipo: 'pie' });
  agregar('Producción',
    { titulo: 'Resumen de sostenimiento', tipo: 'summary', resumen: [
      { nombre: 'Equipos', valor: new Set(operaciones.map(op => op.n_equipo || op.equipo)).size },
      { nombre: 'Metros instalados', valor: sumar(filas, 'metros'), unidad: 'm' },
      { nombre: 'Registros de labor', valor: filas.filter(f => !!f.labor).length },
      { nombre: 'Pernos instalados', valor: sumar(filas, 'pernos') },
    ] },
    { titulo: 'Pernos por equipo y tipo', tipo: 'bar', unidad: 'pernos', categorias, series: nombresTipos.map(nombre => ({ nombre, valores: categorias.map(e => porEquipo.get(e)!.filter(f => f.tipo === nombre).reduce((s, f) => s + f.pernos, 0)) })) },
    { titulo: 'Pernos por día y turno', tipo: 'bar', unidad: 'pernos', categorias: fechas, series: turnos.map(nombre => ({ nombre, valores: fechas.map(fecha => sumar(filas.filter(f => f.fecha === fecha && f.turno === nombre), 'pernos')) })) },
    serie('Pernos por labor', filas, f => f.labor || 'SIN_LABOR', 'Pernos', g => sumar(g, 'pernos'), 'pernos'),
    pie('Pernos instalados por tipo', tipos, f => (f as typeof tipos[number]).tipo),
    serie('Metros por equipo', filas, f => f.equipo, 'Metros', g => sumar(g, 'metros'), 'm'),
    pie('Pernos por tipo de minado', filas, f => f.minado),
  );
  // El horómetro de cada operación se suma una sola vez, independientemente del número de registros.
  const equipos = [...new Set(operaciones.map(op => String(op.n_equipo || op.equipo || 'SIN_EQUIPO')))].sort();
  const lecturas = ['diesel', 'electrico', 'percusion'];
  const nombres = ['H. Diesel', 'H. Eléctrico', 'H. Percusión'];
  agregar('HORAS OPERATIVAS',
    { titulo: 'Horómetros por equipo', tipo: 'bar', unidad: 'h', categorias: equipos, series: lecturas.map((tipo, i) => ({ nombre: nombres[i], valores: equipos.map(e => operaciones.filter(op => String(op.n_equipo || op.equipo || 'SIN_EQUIPO') === e).reduce((s, op) => s + obtenerHorasHorometroSostenimiento(op, tipo), 0)) })) },
    { titulo: 'Horómetros totales', tipo: 'bar', unidad: 'h', categorias: ['Total'], series: lecturas.map((tipo, i) => ({ nombre: nombres[i], valores: [operaciones.reduce((s, op) => s + obtenerHorasHorometroSostenimiento(op, tipo), 0)] })) },
  );
}
