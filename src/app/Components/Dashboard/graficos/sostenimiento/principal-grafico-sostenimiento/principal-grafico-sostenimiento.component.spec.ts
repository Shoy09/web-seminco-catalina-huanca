import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { EquipoService } from 'app/services/equipo.service';
import { Equipo } from 'app/models/equipo.model';
import { ExcelEmpernadorExportService } from 'app/services/Excel/excel-empernador-export.service';
import { EstadoService } from '../../../../../services/estado.service';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';
import { PlanMensualService } from '../../../../../services/plan-mensual.service';
import { PrincipalGraficoSostenimientoComponent } from './principal-grafico-sostenimiento.component';
import { IndicadorPowerBiComponent } from './indicador-power-bi.component';
import jsPDF from 'jspdf';
import { agregarTablaContinuaPDF, configurarCabeceraPDF } from 'src/app/config/config-pdf';

describe('PrincipalGraficoSostenimientoComponent', () => {
  let component: PrincipalGraficoSostenimientoComponent;
  let fixture: ComponentFixture<PrincipalGraficoSostenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoSostenimientoComponent],
      providers: [
        { provide: EquipoService, useValue: { getEquiposByProceso: () => of([]) } },
        { provide: ExcelEmpernadorExportService, useValue: {} },
        { provide: EstadoService, useValue: { getEstadosByProceso: () => of([]) } },
        { provide: FechasPlanMensualService, useValue: { getUltimaFecha: () => of({}) } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(undefined) }) } },
        { provide: OperacionesService, useValue: { getAllAprobados: () => of({ data: [] }) } },
        { provide: PlanMensualService, useValue: {} },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoSostenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('conserva las diferencias negativas de percusión para identificar lecturas incorrectas', () => {
    const base = {
      fecha: '2026-10-17', turno: 'DÍA', equipo: 'Empernador', n_equipo: 'BT1', operador: '', jefe_guardia: '',
      registros: [{ id: 1, numero: 1, estado: 'OPERATIVO', codigo: '101', hora_inicio: '07:00', hora_final: '08:00',
        operacion: { labor: 'L1', perno: [{ tipo_pernos: 'Swellex', n_pernos_instalados: '79', log_pernos: '7' }] } }],
    };
    component.operacionesFiltradas = [
      { ...base, horometros: JSON.stringify({ percusion: { inicio: 2297.03, final: 2298.33 } }) },
      { ...base, horometros: { percusion: { inicio: 2066.33, final: 0 } } as unknown as string },
    ];
    const equipo = component.procesarIndicadores()[0];
    expect(equipo.diferencia_percusion).toBeCloseTo(-2065.03, 2);
    expect(equipo.n_pernos).toBe(158);
    expect(equipo.sos_m_hr_hp).toBe(0);
    expect(component.procesarIndicadoresPorLabor().some(fila => fila.diferencia_percusion < 0)).toBeTrue();
  });

  it('limita las cantidades del PDF a dos decimales sin modificar datos ni códigos', () => {
    const pdf = new jsPDF();
    const filas = [{ equipo: '001', promedio: 6.260869565217392, total: 468, metros: 968.660000000001 }];
    agregarTablaContinuaPDF(pdf, {
      columnas: ['equipo', 'promedio', 'total', 'metros'].map(campo => ({ header: campo, dataKey: campo })),
      filas,
    });
    const celdas = (pdf as any).lastAutoTable.body[0].cells;
    expect(celdas.equipo.text).toEqual(['001']);
    expect(celdas.promedio.text).toEqual(['6.26']);
    expect(celdas.total.text).toEqual(['468']);
    expect(celdas.metros.text).toEqual(['968.66']);
    expect(filas[0].promedio).toBe(6.260869565217392);
  });

  it('reserva espacio para la cabecera al continuar una tabla del PDF en otra página', () => {
    configurarCabeceraPDF({ fechaInicio: '2026-10-17', fechaFin: '2026-10-18', turno: 'DÍA' });
    const pdf = new jsPDF({ orientation: 'landscape' });
    const texto = spyOn(pdf, 'text').and.callThrough();
    agregarTablaContinuaPDF(pdf, {
      titulo: 'Detalle de Sostenimiento', startY: 33,
      columnas: [{ header: 'Equipo', dataKey: 'equipo' }, { header: 'Pernos', dataKey: 'pernos' }],
      filas: Array.from({ length: 90 }, (_, indice) => ({ equipo: `BT${indice}`, pernos: indice })),
    }, 'SOSTENIMIENTO — PRODUCCIÓN');
    const tabla = (pdf as any).lastAutoTable;
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
    expect(tabla.settings.margin.top).toBe(33);
    expect(tabla.head[0].cells.equipo.y).toBeGreaterThanOrEqual(33);
    expect(tabla.body[89].cells.equipo.y).toBeGreaterThanOrEqual(33);
    const titulos = texto.calls.allArgs().filter(args => args[0] === 'Detalle de Sostenimiento');
    expect(titulos.length).toBe(pdf.getNumberOfPages());
  });

  it('exporta el gráfico correcto cuando el resumen se muestra fuera de la lista de gráficos', async () => {
    component.indicadoresPowerBi = [{ nombre: 'Disponibilidad', descripcion: '', graficos: [
      { titulo: 'Resumen', tipo: 'summary', resumen: [{ nombre: 'Equipos', valor: 1 }] },
      { titulo: 'Horas', tipo: 'bar', categorias: ['BT1'], series: [{ nombre: 'Horas', valores: [12] }] },
    ] }];
    component.paginaSeleccionada = 'Disponibilidad';
    fixture.detectChanges();
    spyOn<any>(component, 'delay').and.resolveTo();
    const captura = spyOn(IndicadorPowerBiComponent.prototype, 'getChartImage').and.returnValue(
      document.createElement('canvas').toDataURL('image/png'),
    );
    const guardar = jasmine.createSpy('guardarPDF');
    (jsPDF.API as any).save = guardar;
    try {
      await component.generarPDF();
    } finally {
      delete (jsPDF.API as any).save;
    }
    expect(captura).toHaveBeenCalledTimes(1);
    expect(guardar).toHaveBeenCalled();
    expect(component.errorPDF).toBe('');
    expect(component.cargandoPDF).toBeFalse();
    expect(component.paginaSeleccionada).toBe('Disponibilidad');
  });

  it('muestra la carga mientras espera operaciones y permite reintentar tras un error', () => {
    const respuesta = new Subject<any>();
    const llamada = spyOn(TestBed.inject(OperacionesService), 'getAllAprobados').and.returnValue(respuesta);
    component.cargarOperaciones();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-dashboard-loading')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.reporte-tabs')).toBeNull();
    respuesta.error(new Error('Sin conexión'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-dashboard-loading')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Reintentar');
    llamada.and.returnValue(of({ ok: true, data: [] }));
    component.cargarOperaciones();
    fixture.detectChanges();
    expect(component.cargando).toBeFalse();
    expect(component.errorCarga).toBe('');
    expect(fixture.nativeElement.querySelector('.reporte-tabs')).toBeTruthy();
  });

  it('carga solo códigos de empernador en el select y filtra por n_equipo', () => {
    const catalogo = [
      { proceso: 'EMPERNADOR', codigo: ' BT1 ' },
      { proceso: ' empernador ', codigo: 'BT1' },
      { proceso: 'SCALAMIN', codigo: 'SC1' },
      { proceso: 'EMPERNADOR', codigo: null },
    ] as Equipo[];
    spyOn(TestBed.inject(EquipoService), 'getEquiposByProceso').and.returnValue(of(catalogo));
    const base = { fecha: '2026-10-16', turno: 'DÍA', equipo: 'Empernador', n_equipo: 'BT1', operador: '', jefe_guardia: '', registros: [] };
    component.operacionesOriginal = [base, { ...base, n_equipo: 'BT2' }];
    component.cargarEquipos();

    expect(component.equiposFiltro).toEqual(['BT1']);
    component.fechaInicio = '';
    component.fechaFin = '';
    component.turnoSeleccionado = '';
    component.equipoSeleccionado = 'BT1';
    component.aplicarFiltro();
    expect(component.operacionesFiltradas).toEqual([base]);
  });

  it('builds the unified charts and retains the production detail tables without monthly plans', () => {
    component.operacionesFiltradas = [{
      fecha: '2026-10-16',
      turno: 'DÍA',
      equipo: 'EMP',
      n_equipo: '01',
      operador: 'Operador 1',
      jefe_guardia: 'Jefe 1',
      registros: [{
        id: 1,
        numero: 1,
        estado: 'OPERATIVO',
        codigo: '101',
        hora_inicio: '07:00',
        hora_final: '08:00',
        operacion: {
          tipo_labor: 'GAL',
          labor: '100',
          ala: 'N',
          perno: [
            { tipo_pernos: 'Split set', n_pernos_instalados: '2', log_pernos: '6' },
            { tipo_pernos: 'Helicoidal', n_pernos_instalados: '3', log_pernos: '4' },
          ],
        },
      }],
    }];
    component.planesMensuales = [];

    component.procesarTodo();

    const produccion = component.indicadoresPowerBi.find(
      (pagina) => pagina.nombre === 'Producción',
    )!;
    const pernosPorDia = produccion.graficos.find(
      (grafico) => grafico.titulo === 'Pernos por día y turno',
    )!;
    const pernosPorEquipo = produccion.graficos.find(
      (grafico) => grafico.titulo === 'Pernos por equipo y tipo',
    )!;
    const pernosPorMinado = produccion.graficos.find(
      (grafico) => grafico.titulo === 'Pernos por tipo de minado',
    )!;

    expect(pernosPorDia.categorias).toEqual(['2026-10-16']);
    expect(pernosPorDia.series?.[0].valores).toEqual([5]);
    expect(pernosPorEquipo.categorias).toEqual(['01']);
    expect(pernosPorEquipo.series?.map(({ nombre, valores }) => [nombre, valores[0]]))
      .toEqual([['Split set', 2], ['Helicoidal', 3]]);
    expect(pernosPorMinado.categorias).toEqual(['SIN_PLAN']);
    expect(pernosPorMinado.series?.[0].valores).toEqual([5]);
    expect(component.dataIndicadoresLabor.length).toBe(2);
    expect(component.dataIndicadores[0].modelo_equipo).toBe('01');
    expect(component.dataIndicadoresLabor[0].modelo_equipo).toBe('01');
    expect(component.resumenTarjetas.find(item => item.nombre === 'Pernos instalados')?.valor).toBe(5);
    expect(component.resumenTarjetas.find(item => item.nombre === 'Equipos')?.valor).toBe(1);
    expect(component.dataFrPorOperadorTurno[0].rendimiento).toBe(5);
    expect(component.dataFrPorOperadorTurno[0].pernos_instalados).toBe(5);
    component.paginaSeleccionada = 'Producción';
    expect(component.graficosPaginaActual.some(grafico => grafico.tipo === 'summary')).toBeFalse();
    component.operacionesFiltradas = [];
    component.procesarTodo();
    expect(component.resumenTarjetas.every(item => item.valor === 0)).toBeTrue();
  });
});
