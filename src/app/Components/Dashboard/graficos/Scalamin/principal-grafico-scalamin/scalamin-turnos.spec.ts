import { OperacionBaseScalamin, Registro } from 'app/models/OperacionBase.models';
import { OperacionScalamin } from 'app/models/OperacionScalamin';
import { construirAnalisisTurnosScalamin } from './scalamin-turnos';

function op(turno: string, horas: string[], codigos: string[] = []): OperacionBaseScalamin {
  return {
    fecha: '2026-10-18', turno, n_equipo: 'SC-01', equipo: 'Scalamin', operador: '', jefe_guardia: '',
    registros: horas.map((hora, i): Registro<OperacionScalamin> => ({
      id: i, numero: i, codigo: codigos[i] || '101', estado: 'OPERATIVO', hora_inicio: hora, hora_final: null,
      operacion: { area_m2: 0, labor: '', metros_lineales: 0, observaciones: '', tipo_labor_texto: '' },
    })),
  };
}

describe('Análisis de turnos de Scalamin', () => {
  it('muestra ambos turnos cuando el filtro es Todos y separa los puntos', () => {
    const grupos = construirAnalisisTurnosScalamin([op('DÍA', ['08:30']), op('NOCHE', ['20:15'])]);
    expect(grupos.map(g => g.turno)).toEqual(['día', 'noche']);
    expect(grupos[0].puntos[0].x).toBe(8.5);
    expect(grupos[1].puntos[0].x).toBe(20.25);
    expect(grupos[0].puntos[0].grupo).toBe('2026-10-18');
  });

  it('respeta día y noche aplicados, incluso cuando no hay registros', () => {
    expect(construirAnalisisTurnosScalamin([], 'DÍA').map(g => g.turno)).toEqual(['día']);
    expect(construirAnalisisTurnosScalamin([], 'NOCHE').map(g => g.turno)).toEqual(['noche']);
    expect(construirAnalisisTurnosScalamin([], '').length).toBe(2);
  });

  it('continúa el eje nocturno después de medianoche sin alterar el día operativo', () => {
    const puntos = construirAnalisisTurnosScalamin([op('NOCHE', ['23:30', '00:30', '06:45'])], 'NOCHE')[0].puntos;
    expect(puntos.map(p => p.x)).toEqual([23.5, 24.5, 30.75]);
    expect(puntos.every(p => p.grupo === '2026-10-18')).toBeTrue();
  });

  it('usa los mismos códigos que sostenimiento y omite horas inválidas', () => {
    const datos = op('DIA', ['07:15', '08:00', '09:00', '25:00', '10:70', ''], ['201', '120', '999', '101', '101', '101']);
    const puntos = construirAnalisisTurnosScalamin([datos], 'DÍA')[0].puntos;
    expect(puntos.map(p => p.codigo)).toEqual(['201', '120']);
  });
});
