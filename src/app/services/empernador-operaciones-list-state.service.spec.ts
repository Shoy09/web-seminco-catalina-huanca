import { OperacionBase } from '../models/OperacionBase.models';
import { EmpernadorOperacionesListStateService } from './empernador-operaciones-list-state.service';

describe('EmpernadorOperacionesListStateService', () => {
  let service: EmpernadorOperacionesListStateService;

  beforeEach(() => {
    service = new EmpernadorOperacionesListStateService();
  });

  it('restores list filters and pagination once', () => {
    const operacion: OperacionBase = {
      id: 40,
      fecha: '2026-10-07',
      turno: 'NOCHE',
      operador: 'Operador',
      jefe_guardia: 'Jefe',
      equipo: 'Empernador',
      n_equipo: 'EMP-01',
    };

    service.guardar({
      operacionesOriginal: [operacion],
      operacionesFiltradas: [operacion],
      fechaInicio: '2026-10-01',
      fechaFin: '2026-10-07',
      turnoSeleccionado: 'NOCHE',
      turnoAplicado: 'NOCHE',
      mostrarFiltros: false,
      paginaActual: 3,
      registrosPorPagina: 20,
    });

    const estado = service.consumir();

    expect(estado?.paginaActual).toBe(3);
    expect(estado?.registrosPorPagina).toBe(20);
    expect(estado?.turnoAplicado).toBe('NOCHE');
    expect(service.consumir()).toBeNull();
  });

  it('updates validation status in both cached lists', () => {
    const operacion: OperacionBase = {
      id: 40,
      fecha: '2026-10-07',
      turno: 'NOCHE',
      operador: 'Operador',
      jefe_guardia: 'Jefe',
      equipo: 'Empernador',
      n_equipo: 'EMP-01',
      aprobacion: 0,
      revisado: 0,
    };

    service.guardar({
      operacionesOriginal: [operacion],
      operacionesFiltradas: [operacion],
      fechaInicio: '',
      fechaFin: '',
      turnoSeleccionado: '',
      turnoAplicado: '',
      mostrarFiltros: false,
      paginaActual: 1,
      registrosPorPagina: 10,
    });

    service.actualizarValidacion(40, 1, 2);

    const estado = service.consumir();
    expect(estado?.operacionesOriginal[0].aprobacion).toBe(1);
    expect(estado?.operacionesOriginal[0].revisado).toBe(2);
    expect(estado?.operacionesFiltradas[0].aprobacion).toBe(1);
    expect(estado?.operacionesFiltradas[0].revisado).toBe(2);
    expect(operacion.aprobacion).toBe(0);
  });
});
