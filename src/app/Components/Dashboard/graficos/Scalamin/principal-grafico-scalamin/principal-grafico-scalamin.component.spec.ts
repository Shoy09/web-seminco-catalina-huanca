import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalGraficoScalaminComponent } from './principal-grafico-scalamin.component';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PlanProduccionService } from 'app/services/plan-produccion.service';
import { FechasPlanMensualService } from 'app/services/fechas-plan-mensual.service';
import { OperacionesService } from 'app/services/operaciones.service';
import { EstadoService } from 'app/services/estado.service';
import { EquipoService } from 'app/services/equipo.service';
import { ExcelScalaminExportService } from 'app/services/export/excel-export-scalamin.service';
import { OperacionBaseScalamin } from 'app/models/OperacionBase.models';
import { Equipo } from 'app/models/equipo.model';

describe('PrincipalGraficoScalaminComponent', () => {
  let component: PrincipalGraficoScalaminComponent;
  let fixture: ComponentFixture<PrincipalGraficoScalaminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoScalaminComponent],
      providers: [
        { provide: PlanProduccionService, useValue: {} },
        { provide: FechasPlanMensualService, useValue: {} },
        { provide: OperacionesService, useValue: { getAllAprobados: () => of({ data: [] }) } },
        { provide: EstadoService, useValue: { getEstadosByProceso: () => of([]) } },
        { provide: EquipoService, useValue: { getEquiposByProceso: () => of([]) } },
        { provide: ExcelScalaminExportService, useValue: {} },
        { provide: MatDialog, useValue: {} },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoScalaminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-dashboard-scalamin')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Scalamin');
  });

  it('ofrece solo códigos del catálogo de Scalamin aunque las operaciones incluyan otros equipos', () => {
    component.operacionesOriginal = [{ fecha: '2026-10-17', turno: 'DÍA', n_equipo: 'BT1', equipo: 'Empernador', operador: '', jefe_guardia: '' }];
    component.equipos = [
      { proceso: 'SCALAMIN', codigo: 'SC-02' },
      { proceso: ' scalamin ', codigo: ' SC-01 ' },
      { proceso: 'SCALAMIN', codigo: 'SC-01' },
      { proceso: 'EMPERNADOR', codigo: 'BT1' },
      { proceso: 'SCALAMIN', codigo: null },
    ] as Equipo[];

    expect(component.equiposDisponibles).toEqual(['SC-01', 'SC-02']);
    fixture.detectChanges();
    const opciones = Array.from(fixture.nativeElement.querySelectorAll('#equipo-scalamin option') as NodeListOf<HTMLOptionElement>)
      .map(opcion => opcion.value);
    expect(opciones).toContain('SC-01');
    expect(opciones).not.toContain('BT1');
    component.equipos = [];
    expect(component.equiposDisponibles).toEqual([]);
  });

  it('aplica equipo, turno y fechas inclusivas incluso si la fecha contiene hora', () => {
    const base: OperacionBaseScalamin = { fecha: '2026-10-17T09:00:00', turno: 'DÍA', n_equipo: 'SC-01', equipo: 'Scalamin', operador: '', jefe_guardia: '', registros: [] };
    component.operacionesOriginal = [base, { ...base, n_equipo: 'SC-02' }, { ...base, turno: 'NOCHE' }];
    component.fechaInicio = '2026-10-17';
    component.fechaFin = '2026-10-17';
    component.turnoSeleccionado = 'DÍA';
    component.equipoSeleccionado = 'SC-01';
    component.aplicarFiltro();
    expect(component.operacionesFiltradas).toEqual([base]);
    component.quitarFiltro();
    expect(component.operacionesFiltradas.length).toBe(3);
    expect(component.equipoSeleccionado).toBe('');
  });

  it('rechaza rangos invertidos sin sustituir los resultados aplicados', () => {
    const anteriores = component.operacionesFiltradas;
    component.fechaInicio = '2026-10-18';
    component.fechaFin = '2026-10-17';
    component.aplicarFiltro();
    expect(component.operacionesFiltradas).toBe(anteriores);
    expect(component.errorFiltro).toBeTruthy();
  });
});
