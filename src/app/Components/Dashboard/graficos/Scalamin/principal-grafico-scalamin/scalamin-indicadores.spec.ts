import { OperacionBaseScalamin, Registro } from 'app/models/OperacionBase.models';
import { OperacionScalamin } from 'app/models/OperacionScalamin';
import { Estado } from 'app/models/Estado';
import { ganttScalamin, horasRegistro, indicadoresScalamin, paretoScalamin } from './scalamin-indicadores';

function registro(estado: string, inicio: string, fin: string | null, codigo = '1'): Registro<OperacionScalamin> {
  return { id: 1, numero: 1, estado, codigo, hora_inicio: inicio, hora_final: fin,
    operacion: { area_m2: 0, metros_lineales: 0, labor: '', tipo_labor_texto: '', observaciones: 'Revisión' } };
}
function operacion(registros: Registro<OperacionScalamin>[], overrides: Partial<OperacionBaseScalamin> = {}): OperacionBaseScalamin {
  return { fecha: '2026-10-17', turno: 'DÍA', operador: 'Ana', jefe_guardia: '', equipo: 'Scalamin', n_equipo: 'SC-01', guardia: 'A', registros, ...overrides };
}

describe('Indicadores Scalamin', () => {
  it('calcula duraciones nocturnas sin convertir horas inválidas o abiertas en producción', () => {
    expect(horasRegistro('23:30:00', '01:00:00')).toBe(1.5);
    expect(horasRegistro('07:00', null)).toBe(0);
    expect(horasRegistro('28:00', '08:00')).toBe(0);
    expect(horasRegistro('07:00', '07:00')).toBe(0);
  });

  it('calcula razones sobre horas agregadas y conserva disponibilidad cero', () => {
    const ops = [operacion([registro('OPERATIVO', '07:00', '09:00'), registro('DEMORA', '09:00', '10:00')]),
      operacion([registro('MANTENIMIENTO', '07:00', '08:00')], { n_equipo: 'SC-02' })];
    const grupo = indicadoresScalamin(ops, 'guardia')[0];
    expect(grupo.disponibilidad).toBe(75);
    expect(grupo.utilizacion).toBeCloseTo(200 / 3);
    expect(grupo.mtbf).toBe(3);
    expect(grupo.mttr).toBe(1);
    expect(grupo.horasOperativas).toBe(2);
    expect(indicadoresScalamin(ops, 'equipo')[1].disponibilidad).toBe(0);
  });

  it('distingue ausencia de fallas y falta de horas de un valor cero', () => {
    const sinFallas = indicadoresScalamin([operacion([registro('OPERATIVO', '07:00', '08:00')])], 'equipo')[0];
    expect(sinFallas.mtbf).toBeNull();
    expect(sinFallas.mttr).toBeNull();
    expect(indicadoresScalamin([operacion([])], 'equipo')[0].disponibilidad).toBeNull();
    expect(indicadoresScalamin([], 'mes')).toEqual([]);
  });

  it('separa meses de años diferentes y semanas ISO', () => {
    const ops = ['2025-12-31', '2026-01-01', '2026-12-31'].map(fecha => operacion([registro('OPERATIVO', '07:00', '08:00')], { fecha }));
    expect(indicadoresScalamin(ops, 'mes').length).toBe(3);
    expect(indicadoresScalamin(ops, 'semana').length).toBe(2);
  });

  it('usa el catálogo de estados para identificar demoras y ordenar Pareto', () => {
    const estados: Estado[] = [{ id: 1, codigo: 'D1', proceso: 'SCALAMIN', categoria: '', estado_principal: 'Traslado', tipo_estado: 'DEMORAS OPERATIVAS' }];
    const ops = [operacion([registro('OTRO', '07:00', '10:00', 'D1'), registro('DEMORA', '10:00', '11:00', 'D2')])];
    const puntos = paretoScalamin(ops, estados, false);
    expect(puntos.map(p => p.label)).toEqual(['Traslado', 'D2']);
    expect(puntos.map(p => p.acumulado)).toEqual([75, 100]);
  });

  it('reconstruye Gantt sin mezclar fechas ni turnos y omite tareas abiertas', () => {
    const ops = [operacion([registro('OPERATIVO', '07:00', '08:00'), registro('DEMORA', '08:00', null)]),
      operacion([registro('OPERATIVO', '23:00', '01:00')], { turno: 'NOCHE' })];
    const gantt = ganttScalamin(ops, []);
    expect(gantt.length).toBe(2);
    expect(gantt[0].groups[0].rows[0].tasks.length).toBe(1);
  });
});
