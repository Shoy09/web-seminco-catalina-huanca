import { OperacionBaseSostenimiento, Registro } from '../../../../../models/OperacionBase.models';
import { OperacionSostenimiento } from '../../../../../models/OperacionSostenimiento';
import { Estado } from '../../../../../models/Estado';
import { construirIndicadoresSostenimiento } from './sostenimiento-indicadores.builder';

function registro(estado: string, codigo: string, inicio: string, fin: string | null, pernos = 0, observaciones = ''): Registro<OperacionSostenimiento> {
  return { id: 1, numero: 1, estado, codigo, hora_inicio: inicio, hora_final: fin,
    operacion: { labor: pernos ? 'LAB-1' : undefined, observaciones, perno: [{ tipo_pernos: 'Split set', n_pernos_instalados: pernos, log_pernos: 6 }] } };
}
function op(registros: Registro<OperacionSostenimiento>[], extra: Partial<OperacionBaseSostenimiento> = {}): OperacionBaseSostenimiento {
  return { fecha: '2026-10-16', turno: 'DÍA', equipo: 'EMP', n_equipo: '01', guardia: 'A', operador: 'Ana', jefe_guardia: 'Jefe', seccion: 'A', registros, ...extra };
}
type Paginas = ReturnType<typeof construirIndicadoresSostenimiento>;
function grafico(paginas: Paginas, pagina: string, titulo: string) {
  const resultado = paginas.find(p => p.nombre === pagina)?.graficos.find(g => g.titulo === titulo);
  if (!resultado) throw new Error(`Falta ${pagina}: ${titulo}`);
  return resultado;
}

describe('Fórmulas TMDL de sostenimiento', () => {
  const base = op([registro('OPERATIVO', '120', '07:00', '15:00', 20), registro('MANTENIMIENTO', '303', '15:00', '17:00')]);

  it('usa horas registradas y pernos/hora operativa; no imputa turnos de 12 horas', () => {
    const paginas = construirIndicadoresSostenimiento([base]);
    expect(grafico(paginas, 'Disponibilidad', 'Disponibilidad por equipo').series?.[2].valores).toEqual([80]);
    expect(grafico(paginas, 'Utilización', 'Utilización por equipo').series?.[2].valores).toEqual([100]);
    expect(grafico(paginas, 'Rendimiento', 'Rendimiento por equipo').series?.[0].valores).toEqual([2.5]);
    expect(grafico(paginas, 'Rendimiento', 'Rendimiento por equipo').unidad).toBe('pernos/h');
    expect(grafico(paginas, 'MTBF-MTTR', 'MTBF global').valor).toBe(8);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTTR global').valor).toBe(2);
  });

  it('no inventa mantenimiento ni recorta las horas a 12', () => {
    const paginas = construirIndicadoresSostenimiento([op([registro('OPERATIVO', '120', '07:00', '21:00', 28)])]);
    expect(grafico(paginas, 'Disponibilidad', 'Disponibilidad por equipo').series?.[2].valores).toEqual([100]);
    expect(grafico(paginas, 'Utilización', 'Utilización por equipo').series?.[2].valores).toEqual([100]);
    expect(grafico(paginas, 'Rendimiento', 'Rendimiento por equipo').series?.[0].valores).toEqual([2]);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTBF global').valor).toBe(14);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTTR global').valor).toBe(0);
    expect(paginas.flatMap(p => p.graficos).some(g => g.titulo === 'DM y UTI por equipo')).toBeFalse();
  });

  it('calcula razones globales desde las sumas, sin promediar razones por equipo', () => {
    const otra = op([registro('OPERATIVO', '120', '07:00', '14:00', 7),
      registro('MANTENIMIENTO', '303', '14:00', '15:00'), registro('MANTENIMIENTO', '303', '15:00', '16:00'),
      registro('MANTENIMIENTO', '303', '16:00', '17:00')], { n_equipo: '02' });
    const paginas = construirIndicadoresSostenimiento([base, otra]);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTTR global').valor).toBe(1.25);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTBF global').valor).toBe(3.75);
    expect(grafico(paginas, 'Rendimiento', 'Rendimiento global').valor).toBe(27 / 15);
  });

  it('consolida operador/equipo entre fechas y usa sección como guardia del PB', () => {
    const paginas = construirIndicadoresSostenimiento([base, op([registro('OPERATIVO', '120', '07:00', '09:00', 8)], { fecha: '2026-10-17' })]);
    const ranking = grafico(paginas, 'Ranking', 'Rendimiento por operador y equipo');
    expect(ranking.categorias).toEqual(['Ana · 01']);
    expect(ranking.series?.[0].valores).toEqual([2.8]);
    expect(ranking.horizontal).toBeTrue();
    expect(grafico(paginas, 'Disponibilidad', 'Disponibilidad por guardia').categorias).toEqual(['A']);
  });

  it('promedia horas por fecha/equipo/guardia y cuenta registros de labor para frentes', () => {
    const paginas = construirIndicadoresSostenimiento([
      op([registro('OPERATIVO', '120', '07:00', '09:00', 2)]),
      op([registro('OPERATIVO', '120', '19:00', '23:00', 4)], { turno: 'NOCHE' }),
      op([registro('OPERATIVO', '120', '07:00', '09:00', 2)], { n_equipo: '02', seccion: 'B', guardia: 'B' }),
    ]);
    expect(grafico(paginas, 'HORAS OPERATIVAS', 'Promedio de horas operativas por día').series?.[0].valores).toEqual([4]);
    expect(grafico(paginas, 'Ranking', 'Frentes promedio por guardia').series?.[0].valores).toEqual([2, 1]);
  });

  it('agrupa mantenimiento no programado por observación y respeta empates del Pareto', () => {
    const paginas = construirIndicadoresSostenimiento([op([
      registro('MANTENIMIENTO', '303', '07:00', '09:00', 0, 'B'), registro('MANTENIMIENTO', '303', '09:00', '11:00', 0, 'A'),
      registro('MANTENIMIENTO', '302', '11:00', '15:00', 0, 'Programado'),
      registro('DEMORA', '201', '15:00', '17:00', 0, 'B'), registro('DEMORA', '209', '17:00', '19:00', 0, 'A'),
    ])]);
    const mantenimiento = grafico(paginas, 'Pareto Disponibilidad', 'Mantenimiento no programado por observación');
    expect(mantenimiento.categorias).toEqual(['A', 'B']);
    expect(mantenimiento.series?.[0].valores).toEqual([2, 2]);
    expect(mantenimiento.series?.[1].valores).toEqual([50, 100]);
    expect(grafico(paginas, 'Pareto Utilización', 'Demoras por observación').series?.[1].valores).toEqual([100, 100]);
  });

  it('clasifica inspección con el catálogo sin descontar automáticamente el código 206', () => {
    const operaciones = [op([registro('OPERATIVO', '120', '07:00', '15:00'), registro('DEMORA', '206', '15:00', '17:00')])];
    expect(grafico(construirIndicadoresSostenimiento(operaciones), 'Disponibilidad', 'Disponibilidad por equipo').series?.[2].valores).toEqual([100]);
    const estados: Estado[] = [{ id: 1, codigo: '206', estado_principal: 'Inspección de equipo', categoria: 'ACTIVIDADES DE MANTENIMIENTO', tipo_estado: '', proceso: 'EMPERNADOR' }];
    expect(grafico(construirIndicadoresSostenimiento(operaciones, [], estados), 'Disponibilidad', 'Disponibilidad por equipo').series?.[2].valores).toEqual([80]);
  });

  it('cuenta cada horómetro una vez y conserva decimales de metros', () => {
    const operaciones = [op([registro('OPERATIVO', '120', '07:00', '08:00', 1), registro('OPERATIVO', '120', '08:00', '09:00', 1)], { horometros: JSON.stringify({ percusion: { inicio: 10, final: 12 } }) })];
    const paginas = construirIndicadoresSostenimiento(operaciones);
    expect(grafico(paginas, 'Producción', 'Horas de percusión').valor).toBe(2);
    expect(grafico(paginas, 'HORAS OPERATIVAS', 'Horómetros totales').series?.[2].valores).toEqual([2]);
    expect(grafico(paginas, 'Producción', 'Resumen de sostenimiento').resumen?.find(r => r.nombre === 'Metros instalados')?.valor).toBeCloseTo(3.6576);
  });

  it('admite medianoche, ignora horas inválidas y no genera NaN sin datos', () => {
    const paginas = construirIndicadoresSostenimiento([op([registro('OPERATIVO', '120', '23:00', '01:00', 4),
      registro('DEMORA', '201', '27:00', '28:00'), registro('DEMORA', '201', '01:00', null)], { turno: 'NOCHE' })]);
    expect(grafico(paginas, 'Rendimiento', 'Rendimiento por equipo').series?.[0].valores).toEqual([2]);
    expect(grafico(paginas, 'Disponibilidad', 'Disponibilidad por equipo').series?.[0].valores).toEqual([2]);
    expect(grafico(construirIndicadoresSostenimiento([]), 'MTBF-MTTR', 'MTBF global').valor).toBe(0);
  });

  it('aplica objetivos diarios y mensuales del TMDL sin inventar meta semanal', () => {
    const paginas = construirIndicadoresSostenimiento([base]);
    expect(grafico(paginas, 'Producción', 'Pernos instalados por mes').series?.[1].valores).toEqual([17562]);
    expect(grafico(paginas, 'Producción', 'Pernos instalados por día').series?.[1].valores[0]).toBeCloseTo(17562 / 31);
    expect(grafico(paginas, 'Producción', 'Pernos instalados por semana').series?.length).toBe(1);
  });

  it('reconoce correctivo en tipo_estado con códigos distintos de 303 y muestra sus horas', () => {
    const estados: Estado[] = [{ id: 1, codigo: '350', estado_principal: 'MANTENIMIENTO', tipo_estado: 'Mantenimiento correctivo', categoria: 'ACTIVIDADES DE MANTENIMIENTO', proceso: 'EMPERNADOR' }];
    const paginas = construirIndicadoresSostenimiento([op([registro('MANTENIMIENTO', '350', '07:00', '09:00')])], [], estados);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTTR global').valor).toBe(2);
    const tabla = grafico(paginas, 'MTBF-MTTR', 'MTTR por equipo');
    expect(tabla.filas?.[0]['Fallas']).toBe(1);
    expect(tabla.filas?.[0]['Horas correctivas']).toBe(2);
    expect(tabla.filas?.[0]['MTTR (h)']).toBe(2);
  });

  it('reconoce no programado en categoria sin convertir preventivos en fallas', () => {
    const estados: Estado[] = [
      { id: 1, codigo: '350', estado_principal: 'MANTENIMIENTO', tipo_estado: 'Avería', categoria: 'Mantenimiento  no   programado', proceso: 'EMPERNADOR' },
      { id: 2, codigo: '302', estado_principal: 'MANTENIMIENTO', tipo_estado: 'Mantenimiento preventivo', categoria: 'ACTIVIDADES DE MANTENIMIENTO', proceso: 'EMPERNADOR' },
    ];
    const paginas = construirIndicadoresSostenimiento([op([registro('MANTENIMIENTO', '350', '07:00', '08:30'), registro('MANTENIMIENTO', '302', '09:00', '13:00')])], [], estados);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTTR global').valor).toBe(1.5);
    expect(grafico(paginas, 'MTBF-MTTR', 'MTTR por equipo').filas?.[0]['Fallas']).toBe(1);
  });

  it('prioriza sección para guardia y para el promedio de fecha/equipo/guardia', () => {
    const paginas = construirIndicadoresSostenimiento([
      op([registro('OPERATIVO', '101', '07:00', '09:00', 4)], { seccion: 'A', guardia: 'IGNORAR' }),
      op([registro('OPERATIVO', '101', '09:00', '15:00', 12)], { seccion: 'B', guardia: 'IGNORAR' }),
    ]);
    expect(grafico(paginas, 'Disponibilidad', 'Disponibilidad por guardia').categorias).toEqual(['A', 'B']);
    expect(grafico(paginas, 'HORAS OPERATIVAS', 'Promedio de horas operativas por día').series?.[0].valores).toEqual([4]);
  });
});
