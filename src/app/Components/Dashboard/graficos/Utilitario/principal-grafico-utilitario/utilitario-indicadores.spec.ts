import { Estado } from 'app/models/Estado';
import { Registro } from 'app/models/OperacionBase.models';
import {
  DetalleUtilitario, OperacionUtilitario, construirFilas, horasRegistro,
  indicadoresUtilitario, normalizarOperaciones, paretoUtilitario, resumenUtilitario,
} from './utilitario-indicadores';

function registro(estado: string, inicio: string, fin: string | null, codigo = '101', labor = ''): Registro<DetalleUtilitario> {
  return { id: 1, numero: 1, estado, codigo, hora_inicio: inicio, hora_final: fin,
    operacion: { origen_labor: labor, destino_labor: 'Destino distinto', observaciones: codigo } };
}
function op(registros: Registro<DetalleUtilitario>[], overrides: Partial<OperacionUtilitario> = {}): OperacionUtilitario {
  return { fecha: '2026-10-19', turno: 'DÍA', equipo: 'Scissor', n_equipo: 'UT-01', guardia: 'A',
    operador: 'PÉREZ, ANA', jefe_guardia: '', registros, ...overrides };
}
const filas = (ops: OperacionUtilitario[]) => construirFilas(ops);

describe('Indicadores de Utilitario según el modelo DAX', () => {
  it('admite medianoche y descarta registros abiertos, inválidos y de duración cero', () => {
    expect(horasRegistro('23:30:00', '01:00:00')).toBe(1.5);
    expect(horasRegistro('07:00', null)).toBe(0);
    expect(horasRegistro('24:00', '08:00')).toBe(0);
    expect(horasRegistro('07:00', '07:00')).toBe(0);
    expect(horasRegistro('07:60', '09:00')).toBe(0);
  });

  it('calcula razones sobre horas agregadas y separa correctivo de preventivo', () => {
    const f = filas([op([
      registro('OPERATIVO', '07:00', '11:00'), registro('DEMORA', '11:00', '13:00'),
      registro('MANTENIMIENTO', '13:00', '14:00', '303'),
      registro('MANTENIMIENTO', '14:00', '16:00', '302'),
    ])]);
    const r = resumenUtilitario(f);
    expect(r.horasTotales).toBe(9);
    expect(r.horasMtto).toBe(3);
    expect(r.horasCorrectivas).toBe(1);
    expect(r.fallas).toBe(1);
    expect(r.disponibilidad).toBeCloseTo(600 / 9);
    expect(r.utilizacion).toBeCloseTo(400 / 6);
    expect(r.mtbf).toBe(8);
    expect(r.mttr).toBe(1);
  });

  it('respeta alternativos DAX sin fallas y sin horas', () => {
    const r = resumenUtilitario(filas([op([registro('OPERATIVO', '07:00', '09:00')])]));
    expect(r.mtbf).toBe(2);
    expect(r.mttr).toBe(0);
    expect(resumenUtilitario([]).disponibilidad).toBe(0);
    expect(resumenUtilitario([]).utilizacion).toBe(0);
  });

  it('usa el catálogo de SCISSOR para demoras, mantenimiento y correctivo', () => {
    const estados: Estado[] = [
      { id: 1, codigo: 'X', proceso: 'SCISSOR', estado_principal: 'Reparación correctiva', categoria: 'ACTIVIDADES DE MANTENIMIENTO', tipo_estado: '' },
      { id: 2, codigo: 'Y', proceso: 'SCISSOR', estado_principal: 'Falta de labor', categoria: 'DEMORAS NO OPERATIVAS', tipo_estado: '' },
    ];
    const f = construirFilas([op([registro('OTRO', '07:00', '08:00', 'X'), registro('OTRO', '08:00', '09:00', 'Y')])], estados);
    expect(f[0].correctivo).toBeTrue();
    expect(f[1].familia).toBe('DEMORA');
    expect(paretoUtilitario(f, false)[0].label).toBe('Falta de labor');
  });

  it('promedia horas por fecha/equipo/guardia y labores de origen por fecha/equipo', () => {
    const r = resumenUtilitario(filas([
      op([registro('OPERATIVO', '07:00', '09:00', '101', 'A'), registro('OPERATIVO', '09:00', '11:00', '101', 'A')]),
      op([registro('OPERATIVO', '07:00', '09:00', '101', '')], { n_equipo: 'UT-02' }),
    ]));
    expect(r.promedioHoras).toBe(3);
    expect(r.promedioLabores).toBe(1); // Dos registros, no una labor distinta ni los destinos.
  });

  it('calcula equipos utilizados como promedio por fecha/turno con exclusiones', () => {
    const r = resumenUtilitario(filas([
      op([registro('OPERATIVO', '07:00', '08:00')]),
      op([registro('OPERATIVO', '07:00', '08:00')], { n_equipo: 'UT-02' }),
      op([registro('MANTENIMIENTO', '19:00', '20:00', '201')], { turno: 'NOCHE' }),
    ]));
    expect(r.equiposUtilizados).toBe(1); // (2 equipos en día + 0 en noche) / 2.
  });

  it('conserva el año y usa WEEKNUM lunes, sin semanas ISO de otro año', () => {
    const f = filas(['2025-12-31', '2026-01-01', '2026-12-31'].map(fecha =>
      op([registro('OPERATIVO', '07:00', '08:00')], { fecha })));
    expect(indicadoresUtilitario(f, 'mes').length).toBe(3);
    expect(indicadoresUtilitario(f, 'semana').map(r => r.label)).toContain('2026-S01');
    expect(indicadoresUtilitario(f, 'semana').length).toBe(3);
  });

  it('mantiene los empates densos del Pareto de mantenimiento y observaciones de demora', () => {
    const f = filas([op([registro('MANTENIMIENTO', '07:00', '08:00', 'A'), registro('MANTENIMIENTO', '08:00', '09:00', 'B')])]);
    expect(paretoUtilitario(f, true).map(p => p.acumulado)).toEqual([100, 100]);
    expect(paretoUtilitario(f, true, true).map(p => p.acumulado)).toEqual([50, 100]);
  });

  it('normaliza JSON y conserva origen/destino sin convertir metros o área en producción', () => {
    const original = op([registro('OPERATIVO', '07:00', '08:00', '101', 'Labor 1')]);
    const json = { ...original, registros: JSON.stringify(original.registros) } as unknown as OperacionUtilitario;
    expect(normalizarOperaciones([json])[0].registros?.[0].operacion.origen_labor).toBe('Labor 1');
    expect(construirFilas([json])[0].labor).toBe('Labor 1');
    expect(normalizarOperaciones([{ ...original, registros: 'inválido' } as unknown as OperacionUtilitario])[0].registros).toEqual([]);
  });

  it('exporta el formato de Scissor con encabezado de operación y horas en camelCase', () => {
    const respuestaScissor = {
      id: 1,
      fecha: '2026-10-21',
      turno: 'DÍA',
      operador: 'DIOSES, JHOEL',
      guardia: 'A',
      equipo: 'Utilitario',
      codigo_equipo: 'UT-01',
      registros: [{
        nro: 1,
        estado: 'OPERATIVO',
        codigo: '101',
        horaInicio: '07:00',
        horaFin: '09:30',
        operacion: {
          origen: { nivel: '450', tipoLabor: 'RAMPA', labor: 'RAMPA 450', ala: 'NORTE' },
          destino: { nivel: '470', tipoLabor: 'GALERIA', labor: 'GALERIA 470', ala: 'SUR' },
          observaciones: 'Trabajo realizado',
        },
      }],
    } as unknown as OperacionUtilitario;

    const resultado = construirFilas([respuestaScissor]);

    expect(resultado).toEqual([jasmine.objectContaining({
      idOperacion: 1,
      fecha: '2026-10-21',
      turno: 'DIA',
      equipo: 'UT-01',
      operador: 'DIOSES, JHOEL',
      guardia: 'A',
      inicio: '07:00',
      final: '09:30',
      horas: 2.5,
      labor: 'RAMPA 450',
      origenNivel: '450',
      origenTipoLabor: 'RAMPA',
      origenAla: 'NORTE',
      destinoNivel: '470',
      destinoTipoLabor: 'GALERIA',
      destinoLabor: 'GALERIA 470',
      destinoAla: 'SUR',
      observacion: 'Trabajo realizado',
    })]);
  });

});
