import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EquipoService } from 'app/services/equipo.service';
import { EstadoService } from 'app/services/estado.service';
import { OperacionesService } from 'app/services/operaciones.service';
import { Equipo } from 'app/models/equipo.model';
import { PrincipalGraficoUtilitarioComponent } from './principal-grafico-utilitario.component';
import { OperacionUtilitario } from './utilitario-indicadores';

describe('PrincipalGraficoUtilitarioComponent', () => {
  const operaciones = { getAllAprobados: jasmine.createSpy().and.returnValue(of({ data: [] })) };
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    { provide: OperacionesService, useValue: operaciones },
    { provide: EquipoService, useValue: { getEquiposByProceso: () => of([]) } },
    { provide: EstadoService, useValue: { getEstadosByProceso: () => of([]) } },
  ] }));
  const crear = () => TestBed.runInInjectionContext(() => new PrincipalGraficoUtilitarioComponent());

  it('consulta operaciones aprobadas de scissor y equipos del proceso SCISSOR', () => {
    operaciones.getAllAprobados.and.returnValue(of({ data: [] }));
    const c = crear(); c.ngOnInit();
    expect(operaciones.getAllAprobados).toHaveBeenCalledWith('scissor');
    c.equipos = [{ codigo: 'UT-01', proceso: 'SCISSOR' }, { codigo: 'UT-01', proceso: 'SCISSOR' },
      { codigo: 'SC-01', proceso: 'SCALAMIN' }] as Equipo[];
    expect(c.equiposDisponibles).toEqual(['UT-01']);
  });

  it('aplica fecha inclusiva, turno y código y permite limpiar los filtros', () => {
    const c = crear();
    const base: OperacionUtilitario = { fecha: '2026-10-19T07:00:00', turno: 'DÍA', equipo: 'Scissor',
      n_equipo: 'UT-01', operador: '', jefe_guardia: '', registros: [] };
    c.operacionesOriginal = [base, { ...base, n_equipo: 'UT-02' }, { ...base, turno: 'NOCHE' }];
    c.fechaInicio = c.fechaFin = '2026-10-19'; c.turnoSeleccionado = 'DÍA'; c.equipoSeleccionado = 'UT-01';
    c.aplicarFiltro(); expect(c.operacionesFiltradas).toEqual([base]);
    c.fechaInicio = '2026-10-20'; c.aplicarFiltro();
    expect(c.operacionesFiltradas).toEqual([base]); expect(c.errorFiltro).toBeTruthy();
    c.quitarFiltro(); expect(c.operacionesFiltradas.length).toBe(3); expect(c.errorFiltro).toBe('');
  });

  it('expone errores de carga y permite reintentar', () => {
    operaciones.getAllAprobados.and.returnValue(throwError(() => new Error('red')));
    const c = crear(); c.cargarOperaciones();
    expect(c.errorCarga).toBeTruthy(); expect(c.cargando).toBeFalse();
    operaciones.getAllAprobados.and.returnValue(of({ data: [] }));
    c.cargarOperaciones(); expect(c.errorCarga).toBe(''); expect(c.cargando).toBeFalse();
  });
});
