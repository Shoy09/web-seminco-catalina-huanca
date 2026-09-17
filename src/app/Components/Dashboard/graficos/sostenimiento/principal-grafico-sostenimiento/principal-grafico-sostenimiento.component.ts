import { Component, OnInit, ViewChild } from '@angular/core';
import { OperacionBaseSostenimiento } from '../../../../../models/OperacionBase.models';
import { PlanProduccion } from '../../../../../models/plan_produccion.model';
import { PlanProduccionService } from '../../../../../services/plan-produccion.service';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';
import jsPDF from 'jspdf';
import {
  configurarCabeceraPDF,
  agregarCabeceraPDF,
  agregarPaginaGraficos2x3,
  agregarPaginaGraficos2x2,
  agregarPaginaGraficoCompleto,
  agregarPaginaGraficos1x2,
  agregarPaginaTablaPDF,
  PdfExportOptions,
} from 'src/app/config/config-pdf';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumenComponent } from '../Graficos components/Hoja 1/resumen/resumen.component';
import { PernosEquipoComponent } from '../Graficos components/Hoja 1/pernos-equipo/pernos-equipo.component';
import { PernosLaborComponent } from '../Graficos components/Hoja 1/pernos-labor/pernos-labor.component';
import { RendimientoEquipoComponent } from '../Graficos components/Hoja 1/rendimiento-equipo/rendimiento-equipo.component';
import { DemorasOperativasComponent } from '../Graficos components/Hoja 1/demoras-operativas/demoras-operativas.component';
import { DemorasInoperativasComponent } from '../Graficos components/Hoja 1/demoras-inoperativas/demoras-inoperativas.component';
import { HorasMantenimientoComponent } from '../Graficos components/Hoja 1/horas-mantenimiento/horas-mantenimiento.component';
import { PernosInstaladosTipoComponent } from '../Graficos components/Hoja 1/pernos-instalados-tipo/pernos-instalados-tipo.component';
import { MhrEquipoComponent } from '../Graficos components/Hoja 1/mhr-equipo/mhr-equipo.component';
import { MetrosEquipoComponent } from '../Graficos components/Hoja 1/metros-equipo/metros-equipo.component';
import { HorometroEmpernadorComponent } from '../Graficos components/Hoja 1/horometro-empernador/horometro-empernador.component';
import { TotalHorometrosComponent } from '../Graficos components/Hoja 1/total-horometros/total-horometros.component';
import { ScatterTurnosNocheComponent } from '../Graficos components/Hoja 2/scatter-turnos-noche/scatter-turnos-noche.component';
import { ScatterTurnosComponent } from '../Graficos components/Hoja 2/scatter-turnos/scatter-turnos.component';
import { PlanMensualService } from '../../../../../services/plan-mensual.service';
import { PernosMinadoTipoComponent } from '../Graficos components/Hoja 2/pernos-minado-tipo/pernos-minado-tipo.component';
import { HorasPrimeraPerforacionComponent } from '../Graficos components/Hoja 2/horas-primera-perforacion/horas-primera-perforacion.component';
import { DetalleEquipoComponent } from '../Graficos components/Hoja 2/detalle-equipo/detalle-equipo.component';
import { DetalleSostenimientoComponent } from '../Graficos components/Hoja 2/detalle-sostenimiento/detalle-sostenimiento.component';
import { MejoresOperadoresComponent } from '../Graficos components/Hoja 2/mejores-operadores/mejores-operadores.component';
import { RankingOperadorComponent } from '../Graficos components/Hoja 2/ranking-operador/ranking-operador.component';
import { ObservacionesComponent } from '../Graficos components/Hoja 2/observaciones/observaciones.component';
import { PernosDiaComponent } from '../Graficos components/Hoja 1/pernos-dia/pernos-dia.component';
import { SchedulerComponent } from '../../Linea de tiempo/scheduler/scheduler.component';
import { EstadoService } from '../../../../../services/estado.service';
import { OperacionSostenimiento } from '../../../../../models/OperacionSostenimiento';
import { ExcelEmpernadorExportService } from 'app/services/Excel/excel-empernador-export.service';

@Component({
  selector: 'app-principal-grafico-sostenimiento',
  imports: [
    CommonModule,
    FormsModule,
    ResumenComponent,
    PernosEquipoComponent,
    PernosLaborComponent,
    RendimientoEquipoComponent,
    DemorasOperativasComponent,
    DemorasInoperativasComponent,
    HorasMantenimientoComponent,
    PernosInstaladosTipoComponent,
    MhrEquipoComponent,
    MetrosEquipoComponent,
    HorometroEmpernadorComponent,
    TotalHorometrosComponent,
    ScatterTurnosComponent,
    ScatterTurnosNocheComponent,
    PernosMinadoTipoComponent,
    HorasPrimeraPerforacionComponent,
    DetalleEquipoComponent,
    DetalleSostenimientoComponent,
    MejoresOperadoresComponent,
    RankingOperadorComponent,
    ObservacionesComponent,
    PernosDiaComponent,
    SchedulerComponent,
  ],
  templateUrl: './principal-grafico-sostenimiento.component.html',
  styleUrl: './principal-grafico-sostenimiento.component.css',
})
export class PrincipalGraficoSostenimientoComponent implements OnInit {
  anio!: number;
  mes!: string;

  // DATA ORIGINAL (sin filtrar)
  operacionesOriginal: OperacionBaseSostenimiento[] = [];
  operacionesFiltradas: OperacionBaseSostenimiento[] = [];
  planesMensuales: PlanProduccion[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';
  cargandoPDF = false;

  // ViewChild para exportación PDF
  @ViewChild(PernosEquipoComponent)          chartPernosEquipo!: PernosEquipoComponent;
  @ViewChild(PernosDiaComponent)             chartPernosDia!: PernosDiaComponent;
  @ViewChild(PernosLaborComponent)           chartPernosLabor!: PernosLaborComponent;
  @ViewChild(PernosInstaladosTipoComponent)  chartPernosInstalados!: PernosInstaladosTipoComponent;
  @ViewChild(MhrEquipoComponent)             chartMhrEquipo!: MhrEquipoComponent;
  @ViewChild(MetrosEquipoComponent)          chartMetrosEquipo!: MetrosEquipoComponent;
  @ViewChild(RendimientoEquipoComponent)     chartRendimiento!: RendimientoEquipoComponent;
  @ViewChild(DemorasOperativasComponent)     chartDemorasOp!: DemorasOperativasComponent;
  @ViewChild(DemorasInoperativasComponent)   chartDemorasInop!: DemorasInoperativasComponent;
  @ViewChild(HorasMantenimientoComponent)    chartHorasMant!: HorasMantenimientoComponent;
  @ViewChild(HorometroEmpernadorComponent)   chartHorometro!: HorometroEmpernadorComponent;
  @ViewChild(TotalHorometrosComponent)       chartTotalHorometros!: TotalHorometrosComponent;
  @ViewChild(PernosMinadoTipoComponent)      chartPernosMinado!: PernosMinadoTipoComponent;
  @ViewChild(RankingOperadorComponent)       chartRanking!: RankingOperadorComponent;
  @ViewChild(ScatterTurnosComponent)         chartScatterDia!: ScatterTurnosComponent;
  @ViewChild(ScatterTurnosNocheComponent)    chartScatterNoche!: ScatterTurnosNocheComponent;
  DataPernosPorEquipo: any[] = [];
  dataPernoDia: any[] = [];
  DataPernosPorLabor: any[] = [];
  DataDMyUTI: any[] = [];
  DataEstadosSOS: any[] = [];
  dataDemoraIno: any[] = [];
  dataHoraMantenimiento: any[] = [];
  dataPernosInstalados: any[] = [];
  dataMHREquipo: any[] = [];
  dataMetrosEquipo: any[] = [];
  dataHorometrosEquipo: any[] = [];
  dataHorometroGeneral: any[] = [];

  //HOJA 2
  dataHorasNumericas: any[] = [];
  dataPernosMinadoTipo: any[] = [];
  dataProcesoLaborFR: any[] = [];
  dataIndicadores: any[] = [];
  dataIndicadoresLabor: any[] = [];
  dataFrPorOperadorTurno: any[] = [];
  dataLaborFRDetallado: any[] = [];

  resumen = {
    conteoEquipos: 0,
    totalLaboresSostenidas: 0,
    nPernoDia: 0,
    totalMetros: 0,
  };
  estadosProceso: any[] = [];
  ganttData: any[] = [];
  vistaPrincipal: boolean = true;

  constructor(
    private planMensualService: PlanMensualService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService,
    private excelExportService: ExcelEmpernadorExportService
  ) {}

  ngOnInit(): void {
    this.obtenerUltimaFecha();

    // 🔥 SETEO AUTOMÁTICO
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();

    this.cargarOperaciones();
    this.obtenerEstadosPorProceso('EMPERNADOR');
  }

  obtenerEstadosPorProceso(proceso: string) {
    this.estadoService.getEstadosByProceso(proceso)
      .subscribe({
        next: (data) => {
          this.estadosProceso = data;
          this.construirMapaEstados();
        },
        error: (err) => {
          console.error('Error al traer estados por proceso', err);
        }
      });
  }

  toggleVista() {
    this.vistaPrincipal = !this.vistaPrincipal;
  }

  construirMapaEstados() {
    this.mapaEstados.clear();

    this.estadosProceso.forEach(e => {
      const codigo = String(e.codigo || '').trim();
      this.mapaEstados.set(codigo, e);
    });
  }

  mapaEstados: Map<string, any> = new Map();

  cargarOperaciones() {
    const tipo = 'empernador';

    this.operacionesService.getAllAprobados<OperacionSostenimiento>(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginal = resp.data;
        console.log('🔥 DATA OPERACIONES:', this.operacionesOriginal);
        this.aplicarFiltro();
      },
      error: (err) => {
        //console.error('❌ Error al obtener operaciones:', err);
      },
    });
  }

  // =========================================
  // 🔥 PLAN
  // =========================================
  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe({
      next: (ultimaFecha) => {
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;

        if (anio !== undefined) {
          this.anio = anio;
          this.mes = mes.trim().toUpperCase();

          this.obtenerPlanesMensuales(this.anio, this.mes);
        }
      },
      error: (error) => {
        //console.error('❌ Error al obtener la última fecha:', error);
      },
    });
  }

  obtenerPlanesMensuales(anio: number, mes: string): void {
    this.planMensualService.getPlanMensualByYearAndMonth(anio, mes).subscribe({
      next: (planes) => {
        this.planesMensuales = planes;
        console.log('🔥 PLANES MENSUALES:', this.planesMensuales);

        this.procesarTodo();
      },
      error: (error) => {
        //console.error('❌ Error al obtener planes mensuales:', error);
      },
    });
  }

  procesarTodo() {
    if (!this.operacionesFiltradas.length || !this.planesMensuales.length)
      return;

    this.procesarResumen();
    this.DataPernosPorEquipo = this.PernosPorEquipo();
    this.dataPernoDia = this.procesarPernosPorDia();
    this.DataPernosPorLabor = this.PernosPorLabor();
    this.DataDMyUTI = this.ProcesarDMyUTI();
    this.DataEstadosSOS = this.procesarDemorasOperativas();
    this.dataDemoraIno = this.procesarDemorasInoperativas();
    this.dataHoraMantenimiento = this.procesarHorasMantenimiento();
    this.dataPernosInstalados = this.ProcesarPernosInstalados();
    this.dataMHREquipo = this.ProcesarMHrEquipo();
    this.dataMetrosEquipo = this.ProcesarMetrosPerforadosEquipo();
    this.dataHorometrosEquipo = this.ProcesarHorometrosEquipo();
    this.dataHorometroGeneral = this.ProcesarHorometrosGlobal();
    // HOJA 2
    this.dataHorasNumericas = this.procesarHorasNumericas();
    this.dataPernosMinadoTipo = this.ProcesarPernosPorMinadoTipo();
    this.dataProcesoLaborFR = this.procesarLaborFR();
    this.dataIndicadores = this.procesarIndicadores();
    this.dataIndicadoresLabor = this.procesarIndicadoresPorLabor();
    this.dataFrPorOperadorTurno = this.procesarFrPorOperadorTurno();
    this.dataLaborFRDetallado = this.procesarLaborFRDetallado();

    this.construirGanttDataNuevo();
  }

  // =========================================
  // 🔥 FILTRO POR FECHA
  // =========================================
  aplicarFiltro() {
    this.turnoAplicado = this.turnoSeleccionado;

    this.operacionesFiltradas = this.operacionesOriginal.filter((op) => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin && op.fecha > this.fechaFin) return false;

      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;

      return true;
    });
    console.log('DATA FILTRADA:', this.operacionesFiltradas);
    this.procesarTodo();
  }

  quitarFiltro() {
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.fechaInicio = '';
    this.fechaFin = '';
    this.turnoAplicado = '';
    this.turnoSeleccionado = '';

    this.procesarTodo();
  }

  private getTurnoActual(): string {
    const hora = new Date().getHours();

    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    }
    return 'NOCHE';
  }

  private getFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // =========================================
  // 🔥 HELPERS NUEVO FORMATO (perno/malla/perforacion son ARRAYS)
  // =========================================
  private getPerno(opReg: any): any {
    if (!opReg?.perno) return {};
    return Array.isArray(opReg.perno) ? (opReg.perno[0] || {}) : opReg.perno;
  }

  private getMalla(opReg: any): any {
    if (!opReg?.malla) return {};
    return Array.isArray(opReg.malla) ? (opReg.malla[0] || {}) : opReg.malla;
  }

  private getPerforacion(opReg: any): any {
    if (!opReg?.perforacion) return {};
    return Array.isArray(opReg.perforacion) ? (opReg.perforacion[0] || {}) : opReg.perforacion;
  }

  private getNPernos(opReg: any): number {
    return Number(this.getPerno(opReg).n_pernos_instalados) || 0;
  }

  private getLogPernos(opReg: any): number {
    return Number(this.getPerno(opReg).log_pernos) || 0;
  }

  private getTipoPernos(opReg: any): string {
    return this.getPerno(opReg).tipo_pernos || 'SIN_TIPO';
  }

  private getMt52Malla(opReg: any): number {
    return Number(this.getMalla(opReg).mt52_malla) || 0;
  }

  private getNTaladros(opReg: any): number {
    return Number(this.getPerforacion(opReg).n_taladros) || 0;
  }

  private getLongitudPerforacion(opReg: any): number {
    return Number(this.getPerforacion(opReg).longitud_perforacion) || 0;
  }

  async generarPDF(): Promise<void> {
    this.cargandoPDF = true;
    await this.delay(400);

    try {
      configurarCabeceraPDF({
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        turno: this.turnoSeleccionado || null,
        tipoOperacion: 'Sostenimiento — Empernador',
      });

      const opts: PdfExportOptions = {
        pixelRatio: 2,
        exportWidth: 900,
        exportHeight: 480,
        gridLeft: '6%', gridRight: '6%',
        gridTop: '14%', gridBottom: '8%',
      };

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // ── PÁGINA 1: Producción (6 gráficos 2×3) ──────────────────────────
      agregarCabeceraPDF(pdf, 'SOSTENIMIENTO — PRODUCCIÓN');
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const startY1 = 28;
      const margin = 6; const gap = 4;
      const cw3 = (W - margin * 2 - gap * 2) / 3;
      const rh2 = (H - startY1 - margin - gap) / 2;

      const grafProd = [
        { img: this.chartPernosEquipo?.getChartImage(opts),       titulo: 'Pernos por Equipo' },
        { img: this.chartPernosDia?.getChartImage(opts),          titulo: 'Pernos por Día' },
        { img: this.chartPernosLabor?.getChartImage(opts),        titulo: 'Pernos por Labor' },
        { img: this.chartPernosInstalados?.getChartImage(opts),   titulo: 'Pernos por Tipo' },
        { img: this.chartMhrEquipo?.getChartImage(opts),          titulo: 'M/Hr Equipo' },
        { img: this.chartMetrosEquipo?.getChartImage(opts),       titulo: 'Metros Equipo' },
      ];

      grafProd.forEach((g, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = margin + col * (cw3 + gap);
        const y = startY1 + row * (rh2 + gap);
        if (g.img) {
          pdf.setFontSize(7); pdf.setFont('helvetica','bold'); pdf.setTextColor(40,60,90);
          pdf.text(g.titulo, x + cw3/2, y + 3.5, { align: 'center' });
          pdf.addImage(g.img, 'JPEG', x, y + 5, cw3, rh2 - 5, undefined, 'MEDIUM');
        }
      });

      // ── PÁGINA 2: Rendimiento + Mantenimiento (4 gráficos 2×2) ─────────
      agregarPaginaGraficos2x2(pdf, 'SOSTENIMIENTO — RENDIMIENTO Y MANTENIMIENTO', [
        { img: this.chartRendimiento?.getChartImage(opts),   titulo: 'DM% y UTI%' },
        { img: this.chartDemorasOp?.getChartImage(opts),     titulo: 'Demoras Operativas' },
        { img: this.chartDemorasInop?.getChartImage(opts),   titulo: 'Demoras Inoperativas' },
        { img: this.chartHorasMant?.getChartImage(opts),     titulo: 'Horas Mantenimiento' },
      ]);

      // ── PÁGINA 3: Horómetros (2 gráficos 1×2) ──────────────────────────
      agregarPaginaGraficos1x2(pdf, 'SOSTENIMIENTO — HORÓMETROS', [
        { img: this.chartHorometro?.getChartImage(opts),         titulo: 'Horómetro Empernador' },
        { img: this.chartTotalHorometros?.getChartImage(opts),   titulo: 'Total Horómetros' },
      ]);

      // ── PÁGINA 4: Detalle (pernos minado tipo + ranking) ────────────────
      agregarPaginaGraficos1x2(pdf, 'SOSTENIMIENTO — DETALLE', [
        { img: this.chartPernosMinado?.getChartImage(opts),   titulo: 'Pernos por Minado/Tipo' },
        { img: this.chartRanking?.getChartImage(opts),        titulo: 'Ranking Operador' },
      ]);

      // ── PÁGINA 5: Scatter turnos ─────────────────────────────────────────
      const scatterOpts: PdfExportOptions = { ...opts, exportHeight: 600 };
      if (this.turnoAplicado === '' || this.turnoAplicado === 'DÍA') {
        agregarPaginaGraficoCompleto(
          pdf, 'SOSTENIMIENTO — ANÁLISIS TURNO DÍA',
          this.chartScatterDia?.getChartImage(scatterOpts),
          'Scatter Turnos — Día'
        );
      }
      if (this.turnoAplicado === '' || this.turnoAplicado === 'NOCHE') {
        agregarPaginaGraficoCompleto(
          pdf, 'SOSTENIMIENTO — ANÁLISIS TURNO NOCHE',
          this.chartScatterNoche?.getChartImage(scatterOpts),
          'Scatter Turnos — Noche'
        );
      }

      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`sostenimiento-empernador-${fecha}.pdf`);

    } finally {
      this.cargandoPDF = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //METROS PERFORADOS----------------
  // 🔥 CAMBIO NUEVO FORMATO
  calcularMetrosPerforados(registrosArray: any[]): number {
    if (!Array.isArray(registrosArray)) {
      return 0;
    }

    let totalMetros = 0;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;

      try {
        const op = registro.operacion || registro;

        // 🔥 CAMBIO NUEVO FORMATO: acceder a op.perno[0]
        const nPernos = this.getNPernos(op);
        const longPerno = this.getLogPernos(op);

        const metrosRegistro = nPernos * longPerno * 0.3048;

        if (nPernos > 0 && longPerno > 0) {
          totalMetros += metrosRegistro;
        }
      } catch (error) {}
    }

    return totalMetros;
  }

  //GRAFICO 1
  // 🔥 CAMBIO NUEVO FORMATO
  procesarResumen() {
    let totalMetros = 0;
    let totalLaboresSostenidas = 0;
    let totalPernos = 0;

    const fechasSet = new Set<string>();
    const equiposSet = new Set<string>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      equiposSet.add(modeloEquipo);

      try {
        const registrosArray = op.registros;

        if (Array.isArray(registrosArray)) {
          for (const registro of registrosArray) {
            if (registro.estado !== 'OPERATIVO') continue;

            const opReg = registro.operacion || registro;

            // 🔥 CAMBIO NUEVO FORMATO
            const nPernos = this.getNPernos(opReg);
            const longPerno = this.getLogPernos(opReg);

            const metrosRegistro = nPernos * longPerno * 0.3048;

            const laborSOS =
              `${opReg.tipo_labor || ''}${opReg.labor || ''}${opReg.ala || ''}`.trim();

            if (laborSOS !== '' && metrosRegistro > 0) {
              totalLaboresSostenidas++;
            }

            totalPernos += nPernos;
          }

          if (op.fecha) {
            fechasSet.add(op.fecha);
          }

          totalMetros += this.calcularMetrosPerforados(registrosArray);
        }
      } catch (error) {}
    });

    const nDias = fechasSet.size;
    const nPernoDia = nDias > 0 ? totalPernos / nDias : 0;

    this.resumen = {
      conteoEquipos: equiposSet.size,
      totalLaboresSostenidas,
      nPernoDia: Number(nPernoDia.toFixed(2)),
      totalMetros: Number(totalMetros.toFixed(0)),
    };
  }

  //GRAFICO 2
  private construirLaborReal(opReg: any): string {
    const tipo = (opReg.tipo_labor || '').trim();
    const labor = (opReg.labor || '').trim();
    const ala = (opReg.ala || '').trim();
    return `${tipo}|${labor}|${ala}`;
  }

  private construirLaborPlan(plan: any): string {
    const tipo = (plan.tipo_labor || '').trim();
    const labor = (plan.labor || '').trim();
    const ala = (plan.ala || '').trim();
    return `${tipo}|${labor}|${ala}`;
  }

  private crearMapaPlanes(): Map<string, any> {
    const mapa = new Map<string, any>();

    this.planesMensuales.forEach((plan) => {
      const key = this.construirLaborPlan(plan);
      mapa.set(key, plan);
    });

    return mapa;
  }

  private obtenerSeccionLabor(
    opReg: any,
    mapaPlanes: Map<string, any>,
  ): string {
    const key = this.construirLaborReal(opReg);
    const plan = mapaPlanes.get(key);

    if (!plan) {
      return 'SIN_PLAN';
    }

    const ancho = Number(plan.ancho_m) || 0;
    const alto = Number(plan.alto_m) || 0;

    return `${ancho}x${alto}`;
  }

  // 🔥 CAMBIO NUEVO FORMATO
  PernosPorEquipo() {
    const resultadoMap = new Map<string, any>();
    const mapaPlanes = this.crearMapaPlanes();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (registro.estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        // 🔥 CAMBIO NUEVO FORMATO
        const tipoPernos = this.getTipoPernos(opReg);
        const nPernos = this.getNPernos(opReg);

        if (nPernos <= 0) continue;

        const seccionLabor = this.obtenerSeccionLabor(opReg, mapaPlanes);
        const key = `${seccion}|${modeloEquipo}|${tipoPernos}|${seccionLabor}`;

        if (!resultadoMap.has(key)) {
          resultadoMap.set(key, {
            seccion,
            modeloEquipo,
            tipoPernos,
            seccionLabor,
            totalPernos: 0,
          });
        }

        resultadoMap.get(key).totalPernos += nPernos;
      }
    });

    return Array.from(resultadoMap.values());
  }

  //Grafico 2-2
  // 🔥 CAMBIO NUEVO FORMATO
  procesarPernosPorDia() {
    const mapa = new Map<string, number>();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registrosArray = op.registros;
        if (!Array.isArray(registrosArray) || registrosArray.length === 0)
          return;

        const fecha = op.fecha || 'SIN_FECHA';
        const turno = op.turno || 'SIN_TURNO';
        const key = `${fecha}|${turno}`;

        let totalPernosDia = 0;

        for (const registro of registrosArray) {
          if (registro.estado !== 'OPERATIVO') continue;

          const opReg = registro.operacion || registro;

          // 🔥 CAMBIO NUEVO FORMATO
          const nPernos = this.getNPernos(opReg);

          if (nPernos <= 0) continue;
          totalPernosDia += nPernos;
        }

        if (mapa.has(key)) {
          mapa.set(key, mapa.get(key)! + totalPernosDia);
        } else {
          mapa.set(key, totalPernosDia);
        }
      } catch (error) {}
    });

    return Array.from(mapa.entries())
      .map(([key, totalPernos]) => {
        const [fecha, turno] = key.split('|');
        return {
          fecha,
          turno,
          total_pernos: totalPernos,
        };
      })
      .sort((a, b) => {
        const diff = a.fecha.localeCompare(b.fecha);
        return diff !== 0 ? diff : a.turno.localeCompare(b.turno);
      });
  }

  //Grafico 3
  // 🔥 CAMBIO NUEVO FORMATO
  PernosPorLabor() {
    const resultadoMap = new Map<string, any>();
    const mapaPlanes = this.crearMapaPlanes();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (registro.estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        // 🔥 CAMBIO NUEVO FORMATO
        const tipoPernos = this.getTipoPernos(opReg);
        const nPernos = this.getNPernos(opReg);

        if (nPernos <= 0) continue;

        const tipo = (opReg.tipo_labor || '').trim();
        const labor = (opReg.labor || '').trim();
        const ala = (opReg.ala || '').trim();

        const laborCompleta = `${tipo}${labor}${ala}`;
        const seccionLabor = this.obtenerSeccionLabor(opReg, mapaPlanes);
        const key = `${seccion}|${laborCompleta}|${tipoPernos}|${seccionLabor}`;

        if (!resultadoMap.has(key)) {
          resultadoMap.set(key, {
            seccion,
            labor: laborCompleta,
            tipoPernos,
            seccionLabor,
            totalPernos: 0,
          });
        }

        resultadoMap.get(key).totalPernos += nPernos;
      }
    });

    return Array.from(resultadoMap.values());
  }

  //GRAFICO 4
  ProcesarDMyUTI() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const key = `${modeloEquipo}|${seccion}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          modeloEquipo,
          seccion,
          n_operaciones: 0,
          horas_mantenimiento: 0,
          horas_trabajadas: 0,
        });
      }

      const grupo = mapa.get(key);
      grupo.n_operaciones++;

      const mantenimiento = this.calcularDuracionPorEstado(registros, 'MANTENIMIENTO');
      const demoras206 = this.calcularDuracionPorEstado(registros, 'DEMORA', '206');

      const horasMantenimiento = mantenimiento + demoras206;
      grupo.horas_mantenimiento += horasMantenimiento;

      const horasTrabajadas = this.calcularHorasTrabajadas(op);
      grupo.horas_trabajadas += horasTrabajadas;
    });

    const resultado = Array.from(mapa.values()).map((item) => {
      const HayRegistros = item.n_operaciones > 0;
      const HorasProgramadas = item.n_operaciones * 10;

      const HorasMantenimientoAjustado =
        item.horas_mantenimiento === 0
          ? 0.5 * item.n_operaciones
          : item.horas_mantenimiento;

      let DM_SOS = null;
      if (HayRegistros && HorasProgramadas > 0) {
        DM_SOS = (HorasProgramadas - HorasMantenimientoAjustado) / HorasProgramadas;
      }

      const denominador = HorasProgramadas - HorasMantenimientoAjustado;
      let UTI_SOS = null;
      if (HayRegistros && denominador > 0) {
        UTI_SOS = item.horas_trabajadas / denominador;
      }

      return {
        modeloEquipo: item.modeloEquipo,
        seccion: item.seccion,
        DM_SOS: DM_SOS !== null ? Number(DM_SOS.toFixed(4)) : null,
        UTI_SOS: UTI_SOS !== null ? Number(UTI_SOS.toFixed(4)) : null,
        HorasProgramadas,
        HorasMantenimiento: item.horas_mantenimiento,
        HorasMantenimientoAjustado,
        HorasTrabajadas: item.horas_trabajadas,
        totalOperaciones: item.n_operaciones,
      };
    });

    return resultado;
  }

  calcularDuracionPorEstado(
    registros: any[],
    estadoBuscado: string,
    codigo?: string,
  ): number {
    let total = 0;

    for (const r of registros) {
      if (r.estado === estadoBuscado) {
        if (codigo && r.codigo !== codigo) continue;
        total += this.calcularDuracionHoras(r.hora_inicio, r.hora_final);
      }
    }

    return total;
  }

  calcularHorasTrabajadas(op: any): number {
    const diesel = op.horometros?.diesel;
    const electrico = op.horometros?.electrico;

    const difDiesel = diesel ? diesel.final - diesel.inicio : 0;
    const difElectrico = electrico ? electrico.final - electrico.inicio : 0;

    return difDiesel + difElectrico;
  }

  private calcularDuracionHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFinal.split(':').map(Number);

    let inicio = h1 * 60 + m1;
    let fin = h2 * 60 + m2;

    if (fin < inicio) {
      fin += 24 * 60;
    }

    return Number(((fin - inicio) / 60).toFixed(2));
  }

  //Grafico 5
  procesarDemorasOperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosSOS();
    const equiposUnicos = new Set<string>();

    const codigosPermitidos = new Set([
      '201', '202', '203', '204', '205', '207', '208', '211',
    ]);

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      if (modeloEquipo) {
        equiposUnicos.add(modeloEquipo);
      }

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      registros.forEach((r) => {
        if (!codigosPermitidos.has(r.codigo)) return;

        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(r.hora_inicio, r.hora_final!);
        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, { tipo_estado: tipo, horas: duracion });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    resultado.sort((a, b) => b.horas - a.horas);

    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }
      return { ...item, rank };
    });

    let acumulado = 0;
    const totalHoras = resultado.reduce((sum, x) => sum + x.horas, 0);

    resultado = resultado.map((item) => {
      acumulado += item.horas;
      return {
        ...item,
        tiempo_acu: acumulado,
        tiempo_acu_pct: totalHoras > 0 ? acumulado / totalHoras : 0,
      };
    });

    return resultado;
  }

  // 🔥 MAPPING DE CÓDIGOS A TIPOS DE ESTADOS
  getTiposEstadosSOS(): Record<string, string> {
    return {
      // OPERATIVO
      '101': 'Limpieza de mineral',
      '102': 'Perforación de repaso en mineral',
      '103': 'Perforación de limpieza',              // 🔥 NUEVO
      '106': 'Traslado / movimiento',                 // 🔥 NUEVO
      '111': 'Perforación en desmonte',
      '112': 'Perforación de repaso en desmonte',
      '120': 'Perforación para sostenimiento',

      // DEMORA
      '201': 'Falta de Operador',
      '202': 'MpL - mantenimiento preventivo de labor',
      '203': 'Ingreso - Salida',
      '204': 'Charla',
      '205': 'Traslado al equipo',
      '206': 'Inspección de equipo',
      '207': 'Refrigerio',
      '208': 'Traslado de equipo',
      '209': 'Falta de labor',
      '210': 'Falta de servicios (energía - agua - aire)',
      '211': 'Instalación de equipo',
      '212': 'Apoyo en servicios mineros',
      '213': 'Falta de aceros',
      '214': 'Falta de ventilación',
      '215': 'Trabajos varios',
      '216': 'Accidente de equipo',
      '217': 'Recuperación de aceros',

      // MANTENIMIENTO
      '301': 'Mp inicial/final',
      '302': 'Mantenimiento programado',
      '303': 'Mantenimiento correctivo',
      '306': 'Mantenimiento varios',                  // 🔥 NUEVO
      '307': 'Mantenimiento adicional',               // 🔥 NUEVO

      // RESERVA
      '401': 'Reserva',

      // FUERA DE PLAN
      '501': 'Fuera De Plan',
    };
  }

  //Grafico 6
  procesarDemorasInoperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosSOS();
    const equiposUnicos = new Set<string>();

    const codigosPermitidos = new Set([
      '209', '210', '212', '213', '214', '215', '216', '217',
    ]);

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      if (modeloEquipo) {
        equiposUnicos.add(modeloEquipo);
      }

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      registros.forEach((r) => {
        if (!codigosPermitidos.has(r.codigo)) return;

        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(r.hora_inicio, r.hora_final!);
        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, { tipo_estado: tipo, horas: duracion });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    resultado.sort((a, b) => b.horas - a.horas);

    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }
      return { ...item, rank };
    });

    let acumulado = 0;
    const totalHoras = resultado.reduce((sum, x) => sum + x.horas, 0);

    resultado = resultado.map((item) => {
      acumulado += item.horas;
      return {
        ...item,
        tiempo_acu: acumulado,
        tiempo_acu_pct: totalHoras > 0 ? acumulado / totalHoras : 0,
      };
    });

    return resultado;
  }

  //Grafico 7
  procesarHorasMantenimiento() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosSOS();
    const equiposUnicos = new Set<string>();

    const codigosPermitidos = new Set(['301', '302', '303', '206']);

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      if (modeloEquipo) {
        equiposUnicos.add(modeloEquipo);
      }

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      registros.forEach((r) => {
        if (!codigosPermitidos.has(r.codigo)) return;

        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(r.hora_inicio, r.hora_final!);
        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, { tipo_estado: tipo, horas: duracion });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    resultado.sort((a, b) => b.horas - a.horas);

    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }
      return { ...item, rank };
    });

    let acumulado = 0;
    const totalHoras = resultado.reduce((sum, x) => sum + x.horas, 0);

    resultado = resultado.map((item) => {
      acumulado += item.horas;
      return {
        ...item,
        tiempo_acu: acumulado,
        tiempo_acu_pct: totalHoras > 0 ? acumulado / totalHoras : 0,
      };
    });

    return resultado;
  }

  // Grafico 8
  // 🔥 CAMBIO NUEVO FORMATO
  ProcesarPernosInstalados() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      registros.forEach((registro) => {
        if (registro.estado !== 'OPERATIVO') return;

        const opReg = registro.operacion || registro;

        // 🔥 CAMBIO NUEVO FORMATO
        const tipoPernos = this.getTipoPernos(opReg);
        const nPernos = this.getNPernos(opReg);

        if (nPernos <= 0) return;

        if (mapa.has(tipoPernos)) {
          mapa.get(tipoPernos).total += nPernos;
        } else {
          mapa.set(tipoPernos, { tipoPernos, total: nPernos });
        }
      });
    });

    return Array.from(mapa.values());
  }

  //Grafico 9
  ProcesarMHrEquipo() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const key = `${seccion}|${modeloEquipo}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          seccion,
          modeloEquipo,
          metros: 0,
          horasPercusion: 0,
        });
      }

      const grupo = mapa.get(key);

      const metros = this.calcularMetrosPerforados(registros);
      grupo.metros += metros;

      const percusion = (op.horometros as any)?.percusion;

      if (percusion) {
        const diff = percusion.final - percusion.inicio || 0;
        grupo.horasPercusion += Number(diff.toFixed(2));
      }
    });

    const resultado = Array.from(mapa.values()).map((item) => {
      const mh = item.horasPercusion > 0 ? item.metros / item.horasPercusion : 0;

      return {
        seccion: item.seccion,
        modeloEquipo: item.modeloEquipo,
        metros: Number(item.metros.toFixed(2)),
        horasPercusion: Number(item.horasPercusion.toFixed(2)),
        MH: Math.round(mh),
      };
    });

    return resultado;
  }

  //Grafico 10
  ProcesarMetrosPerforadosEquipo() {
    const mapa = new Map<string, number>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const metros = this.calcularMetrosPerforados(registros);

      if (mapa.has(modeloEquipo)) {
        mapa.set(modeloEquipo, mapa.get(modeloEquipo)! + metros);
      } else {
        mapa.set(modeloEquipo, metros);
      }
    });

    const resultado = Array.from(mapa.entries()).map(
      ([modeloEquipo, metros]) => ({
        modeloEquipo,
        metros: Math.round(metros),
      }),
    );

    return resultado;
  }

  //Grafico 11
  ProcesarHorometrosEquipo() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      const horometros = op.horometros as any;

      if (!mapa.has(modeloEquipo)) {
        mapa.set(modeloEquipo, {
          modeloEquipo,
          diesel: 0,
          electrico: 0,
          percusion: 0,
        });
      }

      const grupo = mapa.get(modeloEquipo);

      if (horometros?.diesel) {
        const diffDiesel =
          Number(horometros.diesel.final) - Number(horometros.diesel.inicio) || 0;
        grupo.diesel += Number(diffDiesel.toFixed(2));
      }

      if (horometros?.electrico) {
        const diffElectrico =
          Number(horometros.electrico.final) - Number(horometros.electrico.inicio) || 0;
        grupo.electrico += Number(diffElectrico.toFixed(2));
      }

      if (horometros?.percusion) {
        const diffPercusion =
          Number(horometros.percusion.final) - Number(horometros.percusion.inicio) || 0;
        grupo.percusion += Number(diffPercusion.toFixed(2));
      }
    });

    const resultado = Array.from(mapa.values()).map((item) => ({
      modeloEquipo: item.modeloEquipo,
      diesel: Number(item.diesel.toFixed(2)),
      electrico: Number(item.electrico.toFixed(2)),
      percusion: Number(item.percusion.toFixed(2)),
    }));

    return resultado;
  }

  // Grafico 12
  ProcesarHorometrosGlobal() {
    const acumulado = {
      diesel: 0,
      electrico: 0,
      percusion: 0,
    };

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const horometros = op.horometros as any;

      if (horometros?.diesel) {
        const diffDiesel =
          Number(horometros.diesel.final) - Number(horometros.diesel.inicio) || 0;
        acumulado.diesel += diffDiesel;
      }

      if (horometros?.electrico) {
        const diffElectrico =
          Number(horometros.electrico.final) - Number(horometros.electrico.inicio) || 0;
        acumulado.electrico += diffElectrico;
      }

      if (horometros?.percusion) {
        const diffPercusion =
          Number(horometros.percusion.final) - Number(horometros.percusion.inicio) || 0;
        acumulado.percusion += diffPercusion;
      }
    });

    const resultado = [
      {
        diesel: Number(acumulado.diesel.toFixed(2)),
        electrico: Number(acumulado.electrico.toFixed(2)),
        percusion: Number(acumulado.percusion.toFixed(2)),
      },
    ];

    return resultado;
  }

  //======================================
  // HOJA 2
  //======================================

  // Grafico 13
  procesarHorasNumericas() {
    // 🔥 AGREGADOS 103 y 106
    const codigosValidos = ['101', '102', '103', '106', '111', '112', '120', '201'];

    const result: any[] = [];

    this.operacionesFiltradas.forEach((op, i) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const fecha = op.fecha || 'SIN_FECHA';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      registrosArray.forEach((r, j) => {
        const codigo = String(r?.codigo ?? '').trim();

        if (!codigosValidos.includes(codigo)) return;

        const horaStr = r?.hora_inicio;

        if (!horaStr || typeof horaStr !== 'string') return;

        const partes = horaStr.split(':').map(Number);

        if (partes.length < 2 || isNaN(partes[0]) || isNaN(partes[1])) return;

        const h = partes[0] || 0;
        const m = partes[1] || 0;
        const s = partes[2] || 0;

        const hora_decimal = Number((h + m / 60 + s / 3600).toFixed(4));

        result.push({
          modeloEquipo,
          fecha,
          hora_inicio: horaStr,
          hora_decimal,
          codigo,
        });
      });
    });

    return result.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return a.hora_decimal - b.hora_decimal;
      }
      return a.fecha.localeCompare(b.fecha);
    });
  }

  //Grafico 14
  // 🔥 CAMBIO NUEVO FORMATO
  ProcesarPernosPorMinadoTipo() {
    const mapa = new Map<string, any>();
    const mapaPlanes = this.crearMapaPlanes();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      for (const registro of registros) {
        if (registro.estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        // 🔥 CAMBIO NUEVO FORMATO
        const nPernos = this.getNPernos(opReg);
        if (nPernos <= 0) continue;

        const keyPlan = this.construirLaborReal(opReg);
        const plan = mapaPlanes.get(keyPlan);
        const minadoTipo = plan?.minado_tipo || 'SIN_PLAN';

        const key = `${minadoTipo}`;

        if (!mapa.has(key)) {
          mapa.set(key, { minado_tipo: minadoTipo, totalPernos: 0 });
        }

        mapa.get(key).totalPernos += nPernos;
      }
    });

    return Array.from(mapa.values());
  }

  //Grafico 15
  procesarLaborFR() {
    const mapa = new Map<string, Map<string, any>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const modelo =
        op.equipo && op.n_equipo ? `${op.equipo}-${op.n_equipo}` : 'SIN_EQUIPO';

      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let mejorRegistro: any = null;
      let mejorHora = Infinity;

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        if (horaDecimal < mejorHora) {
          mejorHora = horaDecimal;
          mejorRegistro = r;
        }
      });

      if (!mejorRegistro) return;

      const operacion = mejorRegistro?.operacion || mejorRegistro;

      const tipoLabor = operacion?.tipo_labor || '';
      const labor = operacion?.labor || '';
      const ala = operacion?.ala || '';

      const labor_fr = `${tipoLabor}${labor}${ala}`;

      const key = modelo;

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      mapaFechas.set(fecha, {
        modelo_equipo: modelo,
        fecha,
        hora_inicio: mejorRegistro.hora_inicio,
        labor_fr,
      });
    });

    const result: any[] = [];

    for (const [, fechasMap] of mapa.entries()) {
      fechasMap.forEach((value) => {
        result.push(value);
      });
    }

    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  //Grafico 16
  // 🔥 CAMBIO NUEVO FORMATO
  procesarIndicadores() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modelo =
        op.equipo && op.n_equipo ? `${op.equipo}-${op.n_equipo}` : 'SIN_EQUIPO';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const horometros =
        typeof op.horometros === 'object' && op.horometros !== null
          ? (op.horometros as {
              percusion?: { inicio?: number; final?: number };
            })
          : {};

      const percusionInicio = Number(horometros.percusion?.inicio) || 0;
      const percusionFinal = Number(horometros.percusion?.final) || 0;

      const diferenciaPercusion = Number(
        (percusionFinal - percusionInicio).toFixed(2),
      );

      const metrosPerforadosTotal = this.calcularMetrosPerforados(registros);

      if (!mapa.has(modelo)) {
        mapa.set(modelo, {
          modelo_equipo: modelo,
          diferencia_percusion: 0,
          n_pernos: 0,
          log_pernos: 0,
          log_pernos_count: 0,
          n_labores_sostenidas: 0,
          metros_perforados: 0,
        });
      }

      const data = mapa.get(modelo);

      data.diferencia_percusion += diferenciaPercusion;
      data.metros_perforados += metrosPerforadosTotal;

      registros.forEach((r) => {
        if (r.estado !== 'OPERATIVO') return;

        const opData: any =
  typeof r.operacion === 'object' && r.operacion !== null
    ? r.operacion
    : {};

        // 🔥 CAMBIO NUEVO FORMATO
        const pernos = this.getNPernos(opData);
        data.n_pernos += pernos;

        const logPernos = this.getLogPernos(opData);

        if (logPernos > 0) {
          data.log_pernos += logPernos;
          data.log_pernos_count += 1;
        }

        const tipoLabor = opData.tipo_labor || '';
        const labor = opData.labor || '';
        const ala = opData.ala || '';

        const laborSOS = `${tipoLabor}${labor}${ala}`;

        if (laborSOS.trim() !== '' && pernos > 0) {
          data.n_labores_sostenidas += 1;
        }
      });
    });

    const resultado: any[] = [];

    mapa.forEach((d) => {
      const n_pernos_por_labor =
        d.n_labores_sostenidas > 0 ? d.n_pernos / d.n_labores_sostenidas : 0;

      const sos_m_hr_hp =
        d.diferencia_percusion > 0
          ? d.metros_perforados / d.diferencia_percusion
          : 0;

      const log_pernos_promedio =
        d.log_pernos_count > 0 ? d.log_pernos / d.log_pernos_count : 0;

      resultado.push({
        ...d,
        log_pernos: Number(log_pernos_promedio.toFixed(2)),
        n_pernos_por_labor: Number(n_pernos_por_labor.toFixed(2)),
        sos_m_hr_hp: Number(sos_m_hr_hp.toFixed(2)),
      });
    });

    return resultado;
  }

  //Grafico 17
  // 🔥 CAMBIO NUEVO FORMATO
  procesarIndicadoresPorLabor() {
    const resultado: any[] = [];
    const mapaPlanes = this.crearMapaPlanes();

    this.operacionesFiltradas.forEach((op) => {
      const modelo =
        op.equipo && op.n_equipo ? `${op.equipo}-${op.n_equipo}` : 'SIN_EQUIPO';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const horometros =
        typeof op.horometros === 'object' && op.horometros !== null
          ? (op.horometros as {
              percusion?: { inicio?: number; final?: number };
            })
          : {};

      const percusionInicio = Number(horometros.percusion?.inicio) || 0;
      const percusionFinal = Number(horometros.percusion?.final) || 0;

      const diferenciaPercusion = Number(
        (percusionFinal - percusionInicio).toFixed(2),
      );

      const totalRegistros = registros.length || 1;
      const percusionPorRegistro = diferenciaPercusion / totalRegistros;

      registros.forEach((r) => {
        if (r.estado !== 'OPERATIVO') return;

        const opData: any =
  typeof r.operacion === 'object' && r.operacion !== null
    ? r.operacion
    : {};

        // 🔥 CAMBIO NUEVO FORMATO
        const tipoLabor = opData.tipo_labor || '';
        const labor = opData.labor || '';
        const ala = opData.ala || '';

        const laborRaw = `${tipoLabor}${labor}${ala}`.trim();
        const laborSOS = laborRaw || 'SIN_LABOR';

        const seccionLabor = this.obtenerSeccionLabor(opData, mapaPlanes);

        // 🔥 CAMBIO NUEVO FORMATO
        const pernos = this.getNPernos(opData);
        const logPernos = this.getLogPernos(opData);
        const mt52 = this.getMt52Malla(opData);
        const tipoPernos = this.getTipoPernos(opData);

        const metros = this.calcularMetrosPerforados([r]);

        const sos_m_hr_hp =
          percusionPorRegistro > 0 ? metros / percusionPorRegistro : 0;

        resultado.push({
          modelo_equipo: modelo,
          labor_sos: laborSOS,
          seccion_labor: seccionLabor,

          n_pernos: pernos,
          log_pernos: Number(logPernos.toFixed(2)),
          mt52_malla: mt52,
          tipo_pernos: tipoPernos,

          metros_perforados: metros,
          diferencia_percusion: Number(percusionPorRegistro.toFixed(2)),

          sos_m_hr_hp: Number(sos_m_hr_hp.toFixed(2)),
        });
      });
    });

    console.log('🚀 DETALLE POR REGISTRO:', resultado);

    return resultado;
  }

  // Grafico 18
  procesarFrPorOperadorTurno() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const operador = op.operador || 'SIN_OPERADOR';
      const turno = op.turno || 'SIN_TURNO';

      const key = `${operador}-${turno}`;

      const metros = this.calcularMetrosPerforados(registrosArray);

      const horo = (op as any)?.horometros;
      const percusion = horo?.percusion;

      const difPercusion =
        !isNaN(Number(percusion?.inicio)) && !isNaN(Number(percusion?.final))
          ? Number(percusion.final) - Number(percusion.inicio)
          : 0;

      if (!mapa.has(key)) {
        mapa.set(key, {
          operador,
          turno,
          metros_perforados: 0,
          dif_percusion: 0,
          fr_mhr_hp: 0,
        });
      }

      const item = mapa.get(key)!;

      item.metros_perforados += metros;
      item.dif_percusion += difPercusion;
    });

    for (const item of mapa.values()) {
      item.fr_mhr_hp =
        item.dif_percusion > 0
          ? item.metros_perforados / item.dif_percusion
          : 0;
    }

    return Array.from(mapa.values());
  }

  //Grafico 19
  procesarLaborFRDetallado() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const modelo =
        op.equipo && op.n_equipo ? `${op.equipo}-${op.n_equipo}` : 'SIN_EQUIPO';

      const operador = op.operador || 'SIN_OPERADOR';

      registrosArray.forEach((r) => {
        const operacion = r?.operacion || {};

        const tipo_labor = operacion?.tipo_labor || '';
        const labor = operacion?.labor || '';
        const ala = operacion?.ala || '';

        const observaciones = operacion?.observaciones;

        if (!observaciones || !observaciones.trim()) return;

        const labor_fr = `${tipo_labor}${labor}${ala}`.trim();

        const key = `${modelo}-${operador}-${labor_fr}`;

        if (!mapa.has(key)) {
          mapa.set(key, {
            modelo_equipo: modelo,
            operador,
            labor_fr,
            observaciones,
            count: 0,
          });
        }

        const item = mapa.get(key)!;
        item.count += 1;
      });
    });

    return Array.from(mapa.values());
  }

  //GANTT
  private construirGanttDataNuevo(): void {
    const fechaMap: Record<string, any> = {};

    this.operacionesFiltradas.forEach(op => {
      const fecha = op.fecha || 'SIN_FECHA';
      const turno = op.turno || 'SIN_TURNO';
      const equipoCodigo = `${op.equipo} - ${op.n_equipo}`;

      const key = `${fecha}|${turno}`;

      if (!fechaMap[key]) {
        fechaMap[key] = {
          fecha,
          turno,
          equipos: {}
        };
      }

      if (!fechaMap[key].equipos[equipoCodigo]) {
        fechaMap[key].equipos[equipoCodigo] = {};
      }

      const registros = Array.isArray(op.registros) ? op.registros : [];

      registros.forEach((reg: any) => {
        const estado = (reg.estado || 'SIN ESTADO').toUpperCase().trim();
        const codigo = String(reg.codigo || '').trim();

        if (!reg.hora_inicio || !reg.hora_final) return;

        const estadoMatch = this.mapaEstados.get(codigo);
        const labor = estadoMatch?.estado_principal || estado;

        if (!fechaMap[key].equipos[equipoCodigo][labor]) {
          fechaMap[key].equipos[equipoCodigo][labor] = [];
        }

        fechaMap[key].equipos[equipoCodigo][labor].push({
          start: reg.hora_inicio,
          end: reg.hora_final,
          estado,
          description: codigo,
          tipo_estado: estadoMatch?.tipo_estado || null,
          categoria: estadoMatch?.categoria || null,
          estado_principal: estadoMatch?.estado_principal || null
        });
      });
    });

    this.ganttData = Object.values(fechaMap).map((item: any) => ({
      fecha: item.fecha,
      turno: item.turno,
      groups: Object.entries(item.equipos).map(
        ([equipoCodigo, labores]: any) => ({
          equipoCodigo,
          rows: Object.entries(labores).map(
            ([labor, tasks]: any) => ({
              labor,
              tasks: tasks.sort((a: any, b: any) =>
                a.start.localeCompare(b.start)
              )
            })
          )
        })
      )
    }));

    console.log('📊 GANTT DATA NUEVO:', this.ganttData);
  }

  exportarExcel() {
    this.excelExportService.exportOperacionesToExcel(
      this.operacionesFiltradas,
      'Operaciones'
    );
  }
}