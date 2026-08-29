import { Component, OnInit, ViewChild } from '@angular/core';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';
import { OperacionBaseTLargos } from '../../../../../models/OperacionBase.models';
import { PlanMensual } from '../../../../../models/plan-mensual.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PlanProduccionService } from '../../../../../services/plan-produccion.service';
import { PlanProduccion } from '../../../../../models/plan_produccion.model';
import jsPDF from 'jspdf';
import {
  configurarCabeceraPDF,
  agregarCabeceraPDF,
  agregarPaginaGraficos2x3,
  agregarPaginaGraficos2x2,
  agregarPaginaGraficoCompleto,
  agregarPaginaGraficos1x2,
  agregarPaginaTablaPDF,
  agregarTablaEnCeldaPDF,
  PdfExportOptions,
} from 'src/app/config/config-pdf';
import { SchedulerComponent } from '../../Linea de tiempo/scheduler/scheduler.component';
import { EstadoService } from '../../../../../services/estado.service';
import { OperacionTLargos } from '../../../../../models/OperacionTLargos';
import { RendimientoEquipoComponent } from '../../shared/Graficos components/Rendimiento/rendimiento-equipo/rendimiento-equipo.component';
import {
  generarDiasEntreFechas,
  obtenerPeriodo,
  obtenerPeriodoDesdeKey,
} from '../../../../../utils/fecha-utils';
import { RendimientoDiaComponent } from '../../shared/Graficos components/Rendimiento/rendimiento-dia/rendimiento-dia.component';
import { RendimientoSemanaComponent } from '../../shared/Graficos components/Rendimiento/rendimiento-semana/rendimiento-semana.component';
import { RendimientoMesComponent } from '../../shared/Graficos components/Rendimiento/rendimiento-mes/rendimiento-mes.component';
import { DisponibilidadEquipoComponent } from '../../shared/Graficos components/Disponibilidad/disponibilidad-equipo/disponibilidad-equipo.component';
import { DisponibilidadDiaComponent } from '../../shared/Graficos components/Disponibilidad/disponibilidad-dia/disponibilidad-dia.component';
import { DisponibilidadSemanaComponent } from '../../shared/Graficos components/Disponibilidad/disponibilidad-semana/disponibilidad-semana.component';
import { DisponibilidadMesComponent } from '../../shared/Graficos components/Disponibilidad/disponibilidad-mes/disponibilidad-mes.component';
import { ParetoDisponibilidadComponent } from '../../shared/Graficos components/Pareto/pareto-disponibilidad/pareto-disponibilidad.component';
import { DisponibilidadGuardiaComponent } from '../../shared/Graficos components/Disponibilidad/disponibilidad-guardia/disponibilidad-guardia.component';
import { UtilizacionEquipoComponent } from '../../shared/Graficos components/Utilizacion/utilizacion-equipo/utilizacion-equipo.component';
import { UtilizacionDiaMesComponent } from '../../shared/Graficos components/Utilizacion/app-utilizacion-dia-mes/app-utilizacion-dia-mes.component';
import { UtilizacionSemanaComponent } from '../../shared/Graficos components/Utilizacion/utilizacion-semana/utilizacion-semana.component';
import { UtilizacionMesComponent } from '../../shared/Graficos components/Utilizacion/utilizacion-mes/utilizacion-mes.component';
import { UtilizacionGuardiaComponent } from '../../shared/Graficos components/Utilizacion/utilizacion-guardia/utilizacion-guardia.component';
import { ParetoUtilizacionComponent } from '../../shared/Graficos components/Pareto/pareto-utilizacion/pareto-utilizacion.component';
import { RendimientoGuardiaComponent } from '../../shared/Graficos components/Rendimiento/rendimiento-guardia/rendimiento-guardia.component';
import { RendimientoTipoPerforacionComponent } from '../../shared/Graficos components/Rendimiento/rendimiento-tipo-perforacion/rendimiento-tipo-perforacion.component';
import { ProduccionEquipoComponent } from '../../shared/Graficos components/Produccion/produccion-equipo/produccion-equipo.component';
import { ProduccionDiaComponent } from '../../shared/Graficos components/Produccion/produccion-dia/produccion-dia.component';
import { ProduccionSemanaComponent } from '../../shared/Graficos components/Produccion/produccion-semana/produccion-semana.component';
import { ProduccionMesComponent } from '../../shared/Graficos components/Produccion/produccion-mes/produccion-mes.component';
import { ProduccionGuardiaComponent } from '../../shared/Graficos components/Produccion/produccion-guardia/produccion-guardia.component';
import { ProduccionTipoPerforacionComponent } from '../../shared/Graficos components/Produccion/produccion-tipo-perforacion/produccion-tipo-perforacion.component';
import { ProduccionPromedioDiaComponent } from '../../shared/Graficos components/Produccion/produccion-promedio-dia/produccion-promedio-dia.component';
import { DisponibilidadRankingGuardiaComponent } from '../../shared/Graficos components/Ranking Guardia/disponibilidad-guardia/disponibilidad-guardia.component';
import { UtilizacionRankingGuardiaComponent } from '../../shared/Graficos components/Ranking Guardia/utilizacion-guardia/utilizacion-guardia.component';
import { RendimientoRankingGuardiaComponent } from '../../shared/Graficos components/Ranking Guardia/rendimiento-guardia/rendimiento-guardia.component';
import { RankingOperadorUtilizacionComponent } from '../../shared/Graficos components/Ranking operador/ranking-operador-utilizacion/ranking-operador-utilizacion.component';
import { RankingOperadorRendimientoComponent } from '../../shared/Graficos components/Ranking operador/ranking-operador-rendimiento/ranking-operador-rendimiento.component';
import { RankingOperadorMetrosComponent } from '../../shared/Graficos components/Ranking operador/ranking-operador-metros/ranking-operador-metros.component';
import { MtbfEquipoComponent } from '../../shared/Graficos components/MTBF-MTTR/MTBF/mtbf-equipo/mtbf-equipo.component';
import { MtbfMesComponent } from '../../shared/Graficos components/MTBF-MTTR/MTBF/mtbf-mes/mtbf-mes.component';
import { MtbfSemanaComponent } from '../../shared/Graficos components/MTBF-MTTR/MTBF/mtbf-semana/mtbf-semana.component';
import { MtbfAnoComponent } from '../../shared/Graficos components/MTBF-MTTR/MTBF/mtbf-ano/mtbf-ano.component';
import { MttrEquipoComponent } from '../../shared/Graficos components/MTBF-MTTR/MTTR/mttr-equipo/mttr-equipo.component';
import { MttrMesComponent } from '../../shared/Graficos components/MTBF-MTTR/MTTR/mttr-mes/mttr-mes.component';
import { MttrSemanaComponent } from '../../shared/Graficos components/MTBF-MTTR/MTTR/mttr-semana/mttr-semana.component';
import { MttrAnoComponent } from '../../shared/Graficos components/MTBF-MTTR/MTTR/mttr-ano/mttr-ano.component';
import { HorasOperativasDiaComponent } from '../../shared/Graficos components/HorasOperativas/horas-operativas-dia/horas-operativas-dia.component';
import { HorasOperativasSemanaComponent } from '../../shared/Graficos components/HorasOperativas/horas-operativas-semana/horas-operativas-semana.component';
import { HorasOperativasMesComponent } from '../../shared/Graficos components/HorasOperativas/horas-operativas-mes/horas-operativas-mes.component';
import { YtdDisponibilidadComponent } from '../../shared/Graficos components/YTD/ytd-disponibilidad/ytd-disponibilidad.component';
import { YtdUtilizacionComponent } from '../../shared/Graficos components/YTD/ytd-utilizacion/ytd-utilizacion.component';
import { YtdRendimientoComponent } from '../../shared/Graficos components/YTD/ytd-rendimiento/ytd-rendimiento.component';
import { YtdEquiposUtilizadosComponent } from '../../shared/Graficos components/YTD/ytd-equipos-utilizados/ytd-equipos-utilizados.component';
import { YtdMetrosProduccionComponent } from '../../shared/Graficos components/YTD/ytd-metros-produccion/ytd-metros-produccion.component';
import { YtdHorasOperativasComponent } from '../../shared/Graficos components/YTD/ytd-horas-operativas/ytd-horas-operativas.component';
import { ParetoNoProgramadasComponent } from '../../shared/Graficos components/Dis_Pareto_Detalle/pareto-no-programada/pareto-no-programada.component';
import { DiagramaParetoComponent } from '../../shared/Graficos components/Util_Pareto_Detalle/diagrama-pareto/diagrama-pareto.component';
import { KpiLargoComponent } from '../Graficos components/Hoja 1/kpi-largo/kpi-largo.component';
import { MatDialog } from '@angular/material/dialog';
import { Equipo } from '../../../../../models/equipo.model';
import { PresentacionTlargosDialogComponent } from '../presentacion-tlargos-dialog/presentacion-tlargos-dialog.component';

@Component({
  selector: 'app-principal-grafico-largo',
  imports: [
    CommonModule,
    FormsModule,
    SchedulerComponent,
    RendimientoEquipoComponent,
    RendimientoDiaComponent,
    RendimientoSemanaComponent,
    RendimientoMesComponent,
    DisponibilidadEquipoComponent,
    DisponibilidadDiaComponent,
    DisponibilidadSemanaComponent,
    DisponibilidadMesComponent,
    ParetoDisponibilidadComponent,
    DisponibilidadGuardiaComponent,
    UtilizacionEquipoComponent,
    UtilizacionDiaMesComponent,
    UtilizacionSemanaComponent,
    UtilizacionMesComponent,
    UtilizacionGuardiaComponent,
    ParetoUtilizacionComponent,
    RendimientoGuardiaComponent,
    RendimientoTipoPerforacionComponent,
    ProduccionEquipoComponent,
    ProduccionDiaComponent,
    ProduccionSemanaComponent,
    ProduccionMesComponent,
    ProduccionGuardiaComponent,
    ProduccionTipoPerforacionComponent,
    ProduccionPromedioDiaComponent,
    DisponibilidadRankingGuardiaComponent,
    UtilizacionRankingGuardiaComponent,
    RendimientoRankingGuardiaComponent,
    RankingOperadorUtilizacionComponent,
    RankingOperadorRendimientoComponent,
    RankingOperadorMetrosComponent,
    MtbfEquipoComponent,
    MtbfMesComponent,
    MtbfSemanaComponent,
    MtbfAnoComponent,
    MttrEquipoComponent,
    MttrMesComponent,
    MttrSemanaComponent,
    MttrAnoComponent,
    HorasOperativasDiaComponent,
    HorasOperativasSemanaComponent,
    HorasOperativasMesComponent,
    YtdDisponibilidadComponent,
    YtdUtilizacionComponent,
    YtdRendimientoComponent,
    YtdEquiposUtilizadosComponent,
    YtdMetrosProduccionComponent,
    YtdHorasOperativasComponent,
    ParetoNoProgramadasComponent,
    DiagramaParetoComponent,
    KpiLargoComponent,
  ],
  templateUrl: './principal-grafico-largo.component.html',
  styleUrl: './principal-grafico-largo.component.css',
})
export class PrincipalGraficoLargoComponent implements OnInit {
  anio!: number;
  mes!: string;
  showZoom: boolean = false;

  // DATA ORIGINAL (sin filtrar)
  operacionesOriginal: OperacionBaseTLargos[] = [];
  operacionesFiltradas: OperacionBaseTLargos[] = [];

  planesMensuales: PlanProduccion[] = [];

  // 🔥 DATA FINAL PARA LOS GRAFICOS
  dataAvanceFase: any[] = [];
  dataDisparosEquipo: any[] = []; // 👈 NUEVO
  dataDisparosDia: any[] = [];
  dataDemorasOperativas: any[] = [];
  dataHorasNoOperativas: any[] = [];
  dataHorasMantenimiento: any[] = [];
  dataMetrosDisparoFR: any[] = [];
  dataMhrEquipo: any[] = [];
  dataHorometrosJumbos: any[] = [];
  dataPromedioPrimeraPerfDiaFR: any[] = [];
  dataPromedioPrimeraPerfDiaFRPorFecha: any[] = [];
  dataPromedioUltimaPerfDiaFR: any[] = [];
  dataPromedioUltimaPerfDiaFRPorFecha: any[] = [];
  dataProcesoLaborFR: any[] = [];
  dataPercusionConMetrosJumbos: any[] = [];
  dataFrPorOperadorTurno: any[] = [];
  dataLaborFRDetallado: any[] = [];
  dataTipoPerforacion: any[] = [];
  datadetalleDisparos: any[] = [];
  dataHorasNumericas: any[] = [];

  // Variables para el filtro de fechas
  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';
  resumen = {
    conteoEquipos: 0,
    metrosPorDisparo: 0,
    nDisparosTL: 0,
    totalMetros: 0,
  };

  estadosProceso: any[] = [];
  cargandoPDF = false;

  // ViewChild para exportación PDF
  @ViewChild(DisponibilidadEquipoComponent)      chartDispEquipo!: DisponibilidadEquipoComponent;
  @ViewChild(DisponibilidadDiaComponent)         chartDispDia!: DisponibilidadDiaComponent;
  @ViewChild(DisponibilidadSemanaComponent)      chartDispSemana!: DisponibilidadSemanaComponent;
  @ViewChild(DisponibilidadMesComponent)         chartDispMes!: DisponibilidadMesComponent;
  @ViewChild(ParetoDisponibilidadComponent)      chartParetoDisp!: ParetoDisponibilidadComponent;
  @ViewChild(DisponibilidadGuardiaComponent)     chartDispGuardia!: DisponibilidadGuardiaComponent;
  @ViewChild(ParetoNoProgramadasComponent)       chartParetoDispDetalle!: ParetoNoProgramadasComponent;

  @ViewChild(UtilizacionEquipoComponent)         chartUtilEquipo!: UtilizacionEquipoComponent;
  @ViewChild(UtilizacionDiaMesComponent)         chartUtilDia!: UtilizacionDiaMesComponent;
  @ViewChild(UtilizacionSemanaComponent)         chartUtilSemana!: UtilizacionSemanaComponent;
  @ViewChild(UtilizacionMesComponent)            chartUtilMes!: UtilizacionMesComponent;
  @ViewChild(ParetoUtilizacionComponent)         chartParetoUtil!: ParetoUtilizacionComponent;
  @ViewChild(UtilizacionGuardiaComponent)        chartUtilGuardia!: UtilizacionGuardiaComponent;
  @ViewChild(DiagramaParetoComponent)            chartParetoUtilDetalle!: DiagramaParetoComponent;

  @ViewChild(RendimientoEquipoComponent)         chartRendEquipo!: RendimientoEquipoComponent;
  @ViewChild(RendimientoDiaComponent)            chartRendDia!: RendimientoDiaComponent;
  @ViewChild(RendimientoSemanaComponent)         chartRendSemana!: RendimientoSemanaComponent;
  @ViewChild(RendimientoMesComponent)            chartRendMes!: RendimientoMesComponent;
  @ViewChild(RendimientoGuardiaComponent)        chartRendGuardia!: RendimientoGuardiaComponent;
  @ViewChild(RendimientoTipoPerforacionComponent) chartRendTipo!: RendimientoTipoPerforacionComponent;

  @ViewChild(ProduccionEquipoComponent)          chartProdEquipo!: ProduccionEquipoComponent;
  @ViewChild(ProduccionDiaComponent)             chartProdDia!: ProduccionDiaComponent;
  @ViewChild(ProduccionSemanaComponent)          chartProdSemana!: ProduccionSemanaComponent;
  @ViewChild(ProduccionMesComponent)             chartProdMes!: ProduccionMesComponent;
  @ViewChild(ProduccionGuardiaComponent)         chartProdGuardia!: ProduccionGuardiaComponent;
  @ViewChild(ProduccionTipoPerforacionComponent) chartProdTipo!: ProduccionTipoPerforacionComponent;
  @ViewChild(ProduccionPromedioDiaComponent)     chartProdPromedio!: ProduccionPromedioDiaComponent;

  @ViewChild(DisponibilidadRankingGuardiaComponent)  chartRankDispGuardia!: DisponibilidadRankingGuardiaComponent;
  @ViewChild(UtilizacionRankingGuardiaComponent)     chartRankUtilGuardia!: UtilizacionRankingGuardiaComponent;
  @ViewChild(RendimientoRankingGuardiaComponent)     chartRankRendGuardia!: RendimientoRankingGuardiaComponent;
  @ViewChild(RankingOperadorUtilizacionComponent)    chartRankOpUtil!: RankingOperadorUtilizacionComponent;
  @ViewChild(RankingOperadorRendimientoComponent)    chartRankOpRend!: RankingOperadorRendimientoComponent;
  @ViewChild(RankingOperadorMetrosComponent)         chartRankOpMetros!: RankingOperadorMetrosComponent;

  @ViewChild(MtbfEquipoComponent)               chartMtbfEquipo!: MtbfEquipoComponent;
  @ViewChild(MtbfSemanaComponent)               chartMtbfSemana!: MtbfSemanaComponent;
  @ViewChild(MtbfMesComponent)                  chartMtbfMes!: MtbfMesComponent;
  @ViewChild(MtbfAnoComponent)                  chartMtbfAno!: MtbfAnoComponent;
  @ViewChild(MttrEquipoComponent)               chartMttrEquipo!: MttrEquipoComponent;
  @ViewChild(MttrSemanaComponent)               chartMttrSemana!: MttrSemanaComponent;
  @ViewChild(MttrMesComponent)                  chartMttrMes!: MttrMesComponent;
  @ViewChild(MttrAnoComponent)                  chartMttrAno!: MttrAnoComponent;

  @ViewChild(YtdDisponibilidadComponent)         chartYtdDisp!: YtdDisponibilidadComponent;
  @ViewChild(YtdUtilizacionComponent)            chartYtdUtil!: YtdUtilizacionComponent;
  @ViewChild(YtdRendimientoComponent)            chartYtdRend!: YtdRendimientoComponent;
  @ViewChild(YtdEquiposUtilizadosComponent)      chartYtdEquipos!: YtdEquiposUtilizadosComponent;
  @ViewChild(YtdMetrosProduccionComponent)       chartYtdMetros!: YtdMetrosProduccionComponent;
  @ViewChild(YtdHorasOperativasComponent)        chartYtdHrsOp!: YtdHorasOperativasComponent;

  @ViewChild(HorasOperativasMesComponent)        chartHrsOpMes!: HorasOperativasMesComponent;
  @ViewChild(HorasOperativasSemanaComponent)     chartHrsOpSemana!: HorasOperativasSemanaComponent;
  @ViewChild(HorasOperativasDiaComponent)        chartHrsOpDia!: HorasOperativasDiaComponent;
  ganttData: any[] = [];
  vistaPrincipal: boolean = true;

  equiposProceso: Equipo[] = [];

  DataRendimientoPorEquipo: any[] = [];
  DataRendimientoPorGuardia: any[] = [];
  DataRendimientoPorDia: any[] = [];
  DataRendimientoPorSemana: any[] = [];
  DataRendimientoPorMes: any[] = [];
  DataRendimientoPorTipoPerforacion: any[] = [];

  DataProduccionEquipo: any[] = [];
  DataProduccionDia: any[] = [];
  DataProduccionSemana: any[] = [];
  DataProduccionMes: any[] = [];
  DataProduccionGuardia: any[] = [];
  DataProduccionTipoPerforacion: any[] = [];
  DataProduccionPromedioDia: any[] = [];

  DataRankingUtilizacionGuardia: any[] = [];
  DataRankingRendimientoGuardia: any[] = [];
  DataRankingDisponibilidadGuardia: any[] = [];
  DataRankingOperadorUtilizacion: any[] = [];
  DataRankingOperadorRendimiento: any[] = [];
  DataRankingMetrosGuardia: any[] = [];
  DataRankingMetrosOperador: any[] = [];

  DataMtbfMttrEquipo: any[] = [];
  DataMtbfMttrSemana: any[] = [];
  DataMtbfMttrMes: any[] = [];
  DataMtbfMttrAno: any[] = [];

  DataHorasOperativasDia: any[] = [];
  DataHorasOperativasSemana: any[] = [];
  DataHorasOperativasMes: any[] = [];

  DataYtdEquiposUtilizados: any[] = [];

  DataParetoDisponibilidadDetalle: any[] = [];
  DataParetoUtilizacionDetalle: any[] = [];

  KpiLargo = { rendimientoAll: 0, totalMetros: 0, promedioMetrosDia: 0, promedioHrsOperativas: 0 };

  DataDisponibilidadEquipo: any[] = [];
  DataDisponibilidadDia: any[] = [];
  DataDisponibilidadSemana: any[] = [];
  DataDisponibilidadMes: any[] = [];
  DataParetoDisponibilidad: any[] = [];
  DataDisponibilidadPorGuardia: any[] = [];

  DataUtilizacionPorEquipo: any[] = [];
  DataUtilizacionPorDia: any[] = [];
  DataUtilizacionPorSemana: any[] = [];
  DataUtilizacionPorMes: any[] = [];
  DataUtilizacionPorGuardia: any[] = [];
  DataParetoUtilizacion: any[] = [];

  constructor(
    private planMensualService: PlanProduccionService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.obtenerUltimaFecha();

    // 🔥 SETEO AUTOMÁTICO
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();

    this.cargarOperaciones();
    this.obtenerEstadosPorProceso('PERFORACIÓN TALADROS LARGOS');
  }
  toggleDataZoom(): void {
    this.showZoom = !this.showZoom;
  }

  obtenerEstadosPorProceso(proceso: string) {
    this.estadoService.getEstadosByProceso(proceso).subscribe({
      next: (data) => {
        this.estadosProceso = data;
        //console.log('Estados por proceso:', data);

        // 🔥 CLAVE
        this.construirMapaEstados();
      },
      error: (err) => {
        console.error('Error al traer estados por proceso', err);
      },
    });
  }

  toggleVista() {
    this.vistaPrincipal = !this.vistaPrincipal;
  }

  Presentacion() {
      if (!this.operacionesFiltradas || this.operacionesFiltradas.length === 0) {
        console.warn('No hay datos filtrados para mostrar');
        return;
      }
  
      const dialogRef = this.dialog.open(PresentacionTlargosDialogComponent, {
        width: '1800px',
        maxHeight: '90vh',
        data: {
          operaciones: this.operacionesFiltradas,
          turnoAplicado: this.turnoAplicado,
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
        },
        disableClose: false,
        autoFocus: true,
      });
  
      // Opcional: Escuchar cuando se cierre el diálogo
      dialogRef.afterClosed().subscribe((result) => {
        console.log('Diálogo cerrado', result);
      });
    }

  construirMapaEstados() {
    this.mapaEstados.clear();

    this.estadosProceso.forEach((e) => {
      const codigo = String(e.codigo || '').trim();
      this.mapaEstados.set(codigo, e);
    });

    //console.log('🧩 Mapa de estados construido:', this.mapaEstados.size);
  }

  mapaEstados: Map<string, any> = new Map();

  private getTurnoActual(): string {
    const hora = new Date().getHours();

    // Día: 07:00 - 18:59
    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    }

    // Noche: 19:00 - 06:59
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
  // 🔥 OPERACIONES
  // =========================================
  cargarOperaciones() {
    const tipo = 'tal_largo';

    this.operacionesService.getAllAprobados<OperacionTLargos>(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginal = resp.data;

        console.log('🔥 DATA OPERACIONES:', this.operacionesOriginal);

        // 🔥 SOLO ESTO
        this.aplicarFiltro();
      },
      error: (err) => {
        //console.error('❌ Error al obtener operaciones:', err);
      },
    });
  }

  // =========================================
  // 🔥 FILTRO POR FECHA
  // =========================================
  aplicarFiltro() {
    this.turnoAplicado = this.turnoSeleccionado; // 🔥 CLAVE

    this.operacionesFiltradas = this.operacionesOriginal.filter((op) => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin && op.fecha > this.fechaFin) return false;

      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;

      return true;
    });
    console.log('🔥 OPERACIONES FILTRADAS:', this.operacionesFiltradas);

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

  async generarPDF(): Promise<void> {
    this.cargandoPDF = true;
    await this.delay(400);

    try {
      configurarCabeceraPDF({
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        turno: this.turnoSeleccionado || null,
        tipoOperacion: 'Taladro Largo',
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

      // Eliminar la página vacía inicial que crea jsPDF por defecto
      pdf.deletePage(1);

      // ── PÁGINA 1: Disponibilidad ────────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — DISPONIBILIDAD', [
        { img: this.chartDispEquipo?.getChartImage(opts),      titulo: 'Disponibilidad Equipo' },
        { img: this.chartDispDia?.getChartImage(opts),         titulo: 'Disponibilidad Día' },
        { img: this.chartDispSemana?.getChartImage(opts),      titulo: 'Disponibilidad Semana' },
        { img: this.chartDispMes?.getChartImage(opts),         titulo: 'Disponibilidad Mes' },
        { img: this.chartDispGuardia?.getChartImage(opts),     titulo: 'Disponibilidad Guardia' },
        { img: this.chartParetoDisp?.getChartImage(opts),      titulo: 'Pareto Disponibilidad' },
      ]);

      // ── PÁGINA 2: Pareto Detalle Disponibilidad ──────────────────────────
      agregarPaginaGraficoCompleto(pdf, 'TALADRO LARGO — PARETO DETALLE DISPONIBILIDAD',
        this.chartParetoDispDetalle?.getChartImage({ ...opts, exportHeight: 520 }),
        'Pareto Detalle — Disponibilidad'
      );

      // ── PÁGINA 3: Utilización ────────────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — UTILIZACIÓN', [
        { img: this.chartUtilEquipo?.getChartImage(opts),      titulo: 'Utilización Equipo' },
        { img: this.chartUtilDia?.getChartImage(opts),         titulo: 'Utilización Día' },
        { img: this.chartUtilSemana?.getChartImage(opts),      titulo: 'Utilización Semana' },
        { img: this.chartUtilMes?.getChartImage(opts),         titulo: 'Utilización Mes' },
        { img: this.chartUtilGuardia?.getChartImage(opts),     titulo: 'Utilización Guardia' },
        { img: this.chartParetoUtil?.getChartImage(opts),      titulo: 'Pareto Utilización' },
      ]);

      // ── PÁGINA 4: Pareto Detalle Utilización ────────────────────────────
      agregarPaginaGraficoCompleto(pdf, 'TALADRO LARGO — PARETO DETALLE UTILIZACIÓN',
        this.chartParetoUtilDetalle?.getChartImage({ ...opts, exportHeight: 520 }),
        'Pareto Detalle — Utilización'
      );

      // ── PÁGINA 5: Rendimiento ────────────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — RENDIMIENTO', [
        { img: this.chartRendEquipo?.getChartImage(opts),      titulo: 'Rendimiento Equipo' },
        { img: this.chartRendDia?.getChartImage(opts),         titulo: 'Rendimiento Día' },
        { img: this.chartRendSemana?.getChartImage(opts),      titulo: 'Rendimiento Semana' },
        { img: this.chartRendMes?.getChartImage(opts),         titulo: 'Rendimiento Mes' },
        { img: this.chartRendGuardia?.getChartImage(opts),     titulo: 'Rendimiento Guardia' },
        { img: this.chartRendTipo?.getChartImage(opts),        titulo: 'Rendimiento Tipo Perforación' },
      ]);

      // ── PÁGINA 6: Producción ─────────────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — PRODUCCIÓN', [
        { img: this.chartProdEquipo?.getChartImage(opts),      titulo: 'Producción Equipo' },
        { img: this.chartProdDia?.getChartImage(opts),         titulo: 'Producción Día' },
        { img: this.chartProdSemana?.getChartImage(opts),      titulo: 'Producción Semana' },
        { img: this.chartProdMes?.getChartImage(opts),         titulo: 'Producción Mes' },
        { img: this.chartProdGuardia?.getChartImage(opts),     titulo: 'Producción Guardia' },
        { img: this.chartProdTipo?.getChartImage(opts),        titulo: 'Tipo de Perforación (m)' },
      ]);

      // ── PÁGINA 7: Producción — Promedio ─────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — PRODUCCIÓN (cont.)', [
        { img: this.chartProdPromedio?.getChartImage(opts),    titulo: 'Promedio Metros / Día' },
      ]);

      // ── PÁGINA 8: Ranking ────────────────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — RANKING', [
        { img: this.chartRankDispGuardia?.getChartImage(opts), titulo: 'Disponibilidad Guardia' },
        { img: this.chartRankUtilGuardia?.getChartImage(opts), titulo: 'Utilización Guardia' },
        { img: this.chartRankRendGuardia?.getChartImage(opts), titulo: 'Rendimiento Guardia' },
        { img: this.chartRankOpUtil?.getChartImage(opts),      titulo: 'Ranking Operador — Utilización' },
        { img: this.chartRankOpRend?.getChartImage(opts),      titulo: 'Ranking Operador — Rendimiento' },
      ]);

      // ── PÁGINA 9: Ranking Metraje ────────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — RANKING METRAJE', [
        { img: this.chartRankRendGuardia?.getChartImage(opts), titulo: 'Rendimiento Guardia' },
        { img: this.chartProdGuardia?.getChartImage(opts),     titulo: 'Metros Perforados Guardia' },
        { img: this.chartRankOpMetros?.getChartImage(opts),    titulo: 'Operador — Metros Perforados' },
      ]);

      // ── PÁGINA 10: MTBF / MTTR — todo en una página landscape ───────────
      {
        pdf.addPage([297, 210], 'landscape');
        const startY = agregarCabeceraPDF(pdf, 'TALADRO LARGO — MTBF / MTTR');
        const margin = 6; const gap = 3;
        const W = 297 - margin * 2;
        const H = 210 - startY - margin;
        // 3 columnas × 2 filas
        const cw = (W - gap * 2) / 3;
        const rh = (H - gap) / 2;

        // ── Fila 1: Tabla MTBF equipo | MTBF Semana | MTBF Mes
        agregarTablaEnCeldaPDF(pdf, {
          titulo: 'MTBF por Equipo',
          columnas: [
            { header: 'Equipo',   dataKey: 'equipo' },
            { header: 'MTBF (h)', dataKey: 'mtbf' },
            { header: 'Fallas',   dataKey: 'fallas' },
            { header: 'Hrs Mtto', dataKey: 'horasMttoCorrectivo' },
          ],
          filas: this.DataMtbfMttrEquipo.map(d => ({
            equipo: d.equipo,
            mtbf:   Number(d.mtbf || 0).toFixed(2),
            fallas: d.fallas || 0,
            horasMttoCorrectivo: Number(d.horasMttoCorrectivo || 0).toFixed(2),
          })),
        }, margin, startY, cw, rh);

        const imgMtbfSem = this.chartMtbfSemana?.getChartImage(opts);
        if (imgMtbfSem) {
          pdf.setFontSize(7); pdf.setFont('helvetica','bold'); pdf.setTextColor(40,60,90);
          pdf.text('MTBF - Semana', margin + cw + gap + cw/2, startY + 3.5, { align: 'center' });
          pdf.addImage(imgMtbfSem, 'JPEG', margin + cw + gap, startY + 5, cw, rh - 5, undefined, 'MEDIUM');
        }

        const imgMtbfMes = this.chartMtbfMes?.getChartImage(opts);
        if (imgMtbfMes) {
          pdf.setFontSize(7); pdf.setFont('helvetica','bold'); pdf.setTextColor(40,60,90);
          pdf.text('MTBF - Mes', margin + cw*2 + gap*2 + cw/2, startY + 3.5, { align: 'center' });
          pdf.addImage(imgMtbfMes, 'JPEG', margin + cw*2 + gap*2, startY + 5, cw, rh - 5, undefined, 'MEDIUM');
        }

        // ── Fila 2: Tabla MTTR equipo | MTTR Semana | MTTR Mes
        const row2Y = startY + rh + gap;

        agregarTablaEnCeldaPDF(pdf, {
          titulo: 'MTTR por Equipo',
          columnas: [
            { header: 'Equipo',   dataKey: 'equipo' },
            { header: 'MTTR (h)', dataKey: 'mttr' },
            { header: 'Fallas',   dataKey: 'fallas' },
            { header: 'Hrs Mtto', dataKey: 'horasMttoCorrectivo' },
          ],
          filas: this.DataMtbfMttrEquipo.map(d => ({
            equipo: d.equipo,
            mttr:   Number(d.mttr || 0).toFixed(2),
            fallas: d.fallas || 0,
            horasMttoCorrectivo: Number(d.horasMttoCorrectivo || 0).toFixed(2),
          })),
        }, margin, row2Y, cw, rh);

        const imgMttrSem = this.chartMttrSemana?.getChartImage(opts);
        if (imgMttrSem) {
          pdf.setFontSize(7); pdf.setFont('helvetica','bold'); pdf.setTextColor(40,60,90);
          pdf.text('MTTR - Semana', margin + cw + gap + cw/2, row2Y + 3.5, { align: 'center' });
          pdf.addImage(imgMttrSem, 'JPEG', margin + cw + gap, row2Y + 5, cw, rh - 5, undefined, 'MEDIUM');
        }

        const imgMttrMes = this.chartMttrMes?.getChartImage(opts);
        if (imgMttrMes) {
          pdf.setFontSize(7); pdf.setFont('helvetica','bold'); pdf.setTextColor(40,60,90);
          pdf.text('MTTR - Mes', margin + cw*2 + gap*2 + cw/2, row2Y + 3.5, { align: 'center' });
          pdf.addImage(imgMttrMes, 'JPEG', margin + cw*2 + gap*2, row2Y + 5, cw, rh - 5, undefined, 'MEDIUM');
        }
      }

      // ── PÁGINA 12: YTD ───────────────────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — YTD', [
        { img: this.chartYtdDisp?.getChartImage(opts),         titulo: 'Disponibilidad Año' },
        { img: this.chartYtdUtil?.getChartImage(opts),         titulo: 'Utilización Año' },
        { img: this.chartYtdRend?.getChartImage(opts),         titulo: 'Rendimiento Año' },
        { img: this.chartYtdEquipos?.getChartImage(opts),      titulo: 'Equipos Utilizados' },
        { img: this.chartYtdMetros?.getChartImage(opts),       titulo: 'Metros Producción' },
        { img: this.chartYtdHrsOp?.getChartImage(opts),        titulo: 'Horas Operativas' },
      ]);

      // ── PÁGINA 13: Horas Operativas ──────────────────────────────────────
      agregarPaginaGraficos2x3(pdf, 'TALADRO LARGO — HORAS OPERATIVAS', [
        { img: this.chartHrsOpMes?.getChartImage(opts),        titulo: 'Hrs Operativas Mes' },
        { img: this.chartHrsOpSemana?.getChartImage(opts),     titulo: 'Hrs Operativas Semana' },
        { img: this.chartHrsOpDia?.getChartImage(opts),        titulo: 'Hrs Operativas Día' },
      ]);

      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`taladro-largo-${fecha}.pdf`);

    } finally {
      this.cargandoPDF = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  // =========================================
  // 🔥 PROCESAMIENTO TOTAL
  // =========================================
  procesarTodo() {
    if (!this.operacionesFiltradas.length || !this.planesMensuales.length)
      return;

    this.dataDisparosEquipo = this.procesarDisparosEquipo(); // 👈 NUEVO
    this.dataDisparosDia = this.procesarDisparosDia();
    this.dataDemorasOperativas = this.procesarDemorasOperativas();
    this.dataHorasNoOperativas = this.procesarHorasNoOperativas();
    this.dataHorasMantenimiento = this.procesarHorasMantenimiento();

    this.dataMetrosDisparoFR = this.procesarMetrosPorDisparoFR();
    this.dataMhrEquipo = this.procesarMhrEquipo();
    this.dataHorometrosJumbos = this.procesarHorometrosJumbos();
    this.dataPromedioPrimeraPerfDiaFR = this.procesarPromedioPrimeraPerfDiaFR();
    this.dataPromedioPrimeraPerfDiaFRPorFecha =
      this.procesarPromedioPrimeraPerfDiaFRPorFecha();
    this.dataPromedioUltimaPerfDiaFR = this.procesarPromedioUltimaPerfDiaFR();
    this.dataPromedioUltimaPerfDiaFRPorFecha =
      this.procesarPromedioUltimaPerfDiaFRPorFecha();
    this.dataProcesoLaborFR = this.procesarLaborFR();
    this.dataFrPorOperadorTurno = this.procesarFrPorOperadorTurno();
    this.dataHorasNumericas = this.procesarHorasNumericas();
    this.construirGanttDataNuevo();

    this.DataRendimientoPorEquipo = this.RendimientoSimbaPorEquipo();
    this.DataRendimientoPorGuardia = this.RendimientoPorGuardia();
    this.DataRendimientoPorDia = this.RendimientoSimbaPorDia();
    this.DataRendimientoPorSemana = this.RendimientoSimbaPorSemana();
    this.DataRendimientoPorMes = this.RendimientoSimbaPorMes();
    this.DataRendimientoPorTipoPerforacion = this.RendimientoPorTipoPerforacion();

    this.DataProduccionEquipo = this.ProduccionPorEquipo();
    this.DataProduccionDia = this.ProduccionPorDia();
    this.DataProduccionSemana = this.ProduccionPorSemana();
    this.DataProduccionMes = this.ProduccionPorMes();
    this.DataProduccionGuardia = this.ProduccionPorGuardia();
    this.DataProduccionTipoPerforacion = this.ProduccionPorTipoPerforacion();
    this.DataProduccionPromedioDia = this.ProduccionPromedioPorDia();

    this.DataRankingUtilizacionGuardia = this.UtilizacionPorGuardia();
    this.DataRankingRendimientoGuardia = this.RendimientoPorGuardia();
    this.DataRankingDisponibilidadGuardia = this.DisponibilidadPorGuardia();
    this.DataRankingOperadorUtilizacion = this.UtilizacionPorOperador();
    this.DataRankingOperadorRendimiento = this.RendimientoPorOperador();
    this.DataRankingMetrosGuardia = this.MetrosPerforadosPorGuardia();
    this.DataRankingMetrosOperador = this.MetrosPerforadosPorOperador();

    this.DataMtbfMttrEquipo = this.MtbfMttrPorEquipo();
    this.DataMtbfMttrSemana = this.MtbfMttrPorSemana();
    this.DataMtbfMttrMes = this.MtbfMttrPorMes();
    this.DataMtbfMttrAno = this.MtbfMttrPorAno();

    this.DataHorasOperativasDia = this.HorasOperativasPorDia();
    this.DataHorasOperativasSemana = this.HorasOperativasPorSemana();
    this.DataHorasOperativasMes = this.HorasOperativasPorMes();

    this.DataYtdEquiposUtilizados = this.YtdEquiposUtilizadosPorMes();

    this.DataParetoDisponibilidadDetalle = this.ParetoDisponibilidadDetalle();
    this.DataParetoUtilizacionDetalle = this.ParetoUtilizacionDetalle();
    this.KpiLargo = this.calcularKpiLargo();

    this.DataDisponibilidadEquipo = this.DisponibilidadPorEquipo();
    this.DataDisponibilidadDia = this.DisponibilidadPorDia();
    this.DataDisponibilidadSemana = this.DisponibilidadPorSemana();
    this.DataDisponibilidadMes = this.DisponibilidadPorMes();
    this.DataParetoDisponibilidad = this.ParetoDisponibilidad();
    this.DataDisponibilidadPorGuardia = this.DisponibilidadPorGuardia();
    this.DataUtilizacionPorEquipo = this.UtilizacionPorEquipo();
    this.DataUtilizacionPorDia = this.UtilizacionPorDia();
    this.DataUtilizacionPorSemana = this.UtilizacionPorSemana();
    this.DataUtilizacionPorMes = this.UtilizacionPorMes();
    this.DataUtilizacionPorGuardia = this.UtilizacionPorGuardia();
    this.DataParetoUtilizacion = this.ParetoUtilizacion();
    //console.log('🔥 DATA DISPAROS EQUIPO:', this.dataDisparosEquipo);
  }

  // =========================================
  // 🔥 CALCULO DE FRENTES COMPLETOS
  // =========================================
  contarFrentesCompletos(registrosArray: any[]): number {
    if (!Array.isArray(registrosArray)) return 0;

    let contador = 0;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;

      const operacion = registro.operacion || registro;

      const tipo = (operacion.tipo_perforacion || '').toUpperCase();

      if (tipo === 'PRODUCCIÓN' || tipo === 'SLOT') {
        contador++;
      }
    }

    return contador;
  }

  // =========================================
  // 🔥 OBTENER SECCION DEL PLAN
  // =========================================

  // =========================================
  // 🔥 DATA PARA GRAFICO DISPAROS EQUIPO
  // =========================================
  procesarDisparosEquipo() {
    const mapaDisparos = new Map<
      string,
      {
        modelo_equipo: string;
        seccion_labor: string; // 👈 Cambiado de 'seccion' a 'seccion_labor'
        seccion: string;
        n_frentes: number;
      }
    >();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registrosArray = op.registros;

        if (Array.isArray(registrosArray) && registrosArray.length > 0) {
          // Obtener área del primer registro
          const primerRegistro = registrosArray[0];

          // Obtener sección del plan

          // Contar frentes completos
          const nFrentes = this.contarFrentesCompletos(registrosArray);

          // Usar modelo_equipo como clave única
          const key = op.modelo_equipo || 'SIN_EQUIPO';

          if (mapaDisparos.has(key)) {
            // Acumular frentes si ya existe
            const existing = mapaDisparos.get(key)!;
            existing.n_frentes += nFrentes;
          } else {
            // Crear nueva entrada
            mapaDisparos.set(key, {
              modelo_equipo: op.modelo_equipo || 'SIN_EQUIPO',
              seccion: op.seccion || 'SIN_SECCION', // 👈 Cambiado a 'seccion'
              seccion_labor: 'sin seccion', // 👈 Cambiado a 'seccion_labor'
              n_frentes: nFrentes,
            });
          }
        }
      } catch (error) {
        //console.error('Error procesando operación para disparos equipo:', op.id, error);
      }
    });

    // Convertir el mapa a un array
    return Array.from(mapaDisparos.values());
  }

  // =========================================
  // 🔥 DISPARO POR DIA
  // =========================================

  procesarDisparosDia() {
    const mapa = new Map<string, number>();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registrosArray = op.registros;

        if (Array.isArray(registrosArray) && registrosArray.length > 0) {
          // 🔥 Fecha directa de la operación
          const fecha = op.fecha || 'SIN_FECHA';

          // 🔥 Contar frentes completos (igual que antes)
          const nFrentes = this.contarFrentesCompletos(registrosArray);

          if (mapa.has(fecha)) {
            mapa.set(fecha, mapa.get(fecha)! + nFrentes);
          } else {
            mapa.set(fecha, nFrentes);
          }
        }
      } catch (error) {
        //console.error('Error procesando operación para disparos día:', op.id, error);
      }
    });

    // 🔥 Convertir a array
    return (
      Array.from(mapa.entries())
        .map(([fecha, n_frentes]) => ({
          fecha,
          n_frentes,
        }))
        // 🔥 OPCIONAL: ordenar por fecha
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
    );
  }

  // =========================================
  // 🔥 CALCULO METROS
  // =========================================
  calcularMetrosPerforados(registrosArray: any[]): number {
    if (!Array.isArray(registrosArray)) {
      return 0;
    }

    let totalMetros = 0;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') {
        continue;
      }

      try {
        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        totalMetros += resumen.metrosPerforados;
      } catch (error) {
        console.error(`Error en registro ${registro.numero}:`, error);
      }
    }

    return totalMetros;
  }

  // =========================================
  // 🔥 FILTRAR FASES DEL PLAN
  // =========================================
  private crearMapaPlanes(): Map<string, string> {
    const mapa = new Map<string, string>();

    this.planesMensuales.forEach((p) => {
      const labor_fr = this.construirLaborFR(p.tipo_labor, p.labor, p.ala);

      if (!p.area) return;

      // clave: labor_fr → valor: area
      mapa.set(labor_fr, p.area);
    });

    return mapa;
  }

  private construirLaborFR(tipo_labor: any, labor: any, ala: any): string {
    return `${tipo_labor ?? ''}${labor ?? ''}${ala ?? ''}`.trim();
  }

  calcularDuracionHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFinal.split(':').map(Number);

    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    return (fin - inicio) / 60; // en horas
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

  // =========================================
  // Grafico 6
  // =========================================
  procesarDemorasOperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosMap();
    const equiposUnicos = new Set<string>();

    // 🔹 RECORRER DATA
    this.operacionesFiltradas.forEach((op) => {
      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      // ✅ DISTINCTCOUNT (como DAX: TODOS los equipos)
      if (op.modelo_equipo) {
        equiposUnicos.add(op.modelo_equipo);
      }

      registros.forEach((r) => {
        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(
          r.hora_inicio,
          r.hora_final!,
        );

        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, {
            tipo_estado: tipo,
            horas: duracion,
          });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    // 🔹 BASE (equivalente a SUMX + DIVIDE)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // 🔥 ORDEN DESC (RANKX DESC)
    resultado.sort((a, b) => b.horas - a.horas);

    // 🔥 RANK DENSE (igual que DAX)
    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }

      return {
        ...item,
        rank,
      };
    });

    // 🔥 ACUMULADO (Tiempo_Acu_FR)
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

  getTiposEstadosMap(): Record<string, string> {
    return {
      '201': 'Falta de Operador',
      '202': 'MpL - mantenimiento preventivo de labor',
      '203': 'Ingreso - Salida',
      '204': 'Charla',
      '205': 'Traslado al equipo',
      '207': 'Refrigerio',
      '208': 'Traslado de equipo',
      '211': 'Instalación de equipo',
    };
  }

  // =========================================
  //GRAFICO 7
  // =========================================

  procesarHorasNoOperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosMapNoOperativa();
    const equiposUnicos = new Set<string>();

    // 🔹 RECORRER DATA
    this.operacionesFiltradas.forEach((op) => {
      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      // ✅ DISTINCTCOUNT (como DAX: TODOS los equipos)
      if (op.modelo_equipo) {
        equiposUnicos.add(op.modelo_equipo);
      }

      registros.forEach((r) => {
        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(
          r.hora_inicio,
          r.hora_final!,
        );

        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, {
            tipo_estado: tipo,
            horas: duracion,
          });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    // 🔹 BASE (equivalente a SUMX + DIVIDE)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // 🔥 ORDEN DESC (RANKX DESC)
    resultado.sort((a, b) => b.horas - a.horas);

    // 🔥 RANK DENSE (igual que DAX)
    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }

      return {
        ...item,
        rank,
      };
    });

    // 🔥 ACUMULADO (Tiempo_Acu_FR)
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

  getTiposEstadosMapNoOperativa(): Record<string, string> {
    return {
      '209': 'Falta de labor',
      '210': 'Falta de servicios (energía - agua - aire)',
      '212': 'Apoyo en servicios mineros',
      '213': 'Falta de aceros',
      '214': 'Falta de ventilación',
      '215': 'Trabajos varios',
      '216': 'Accidente de equipo',
      '217': 'Recuperación de aceros',
    };
  }

  // =========================================
  //GRAFICO 8
  // =========================================

  procesarHorasMantenimiento() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosMantenimiento();
    const equiposUnicos = new Set<string>();

    // 🔹 RECORRER DATA
    this.operacionesFiltradas.forEach((op) => {
      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      // ✅ DISTINCTCOUNT (como DAX: TODOS los equipos)
      if (op.modelo_equipo) {
        equiposUnicos.add(op.modelo_equipo);
      }

      registros.forEach((r) => {
        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(
          r.hora_inicio,
          r.hora_final!,
        );

        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, {
            tipo_estado: tipo,
            horas: duracion,
          });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    // 🔹 BASE (equivalente a SUMX + DIVIDE)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // 🔥 ORDEN DESC (RANKX DESC)
    resultado.sort((a, b) => b.horas - a.horas);

    // 🔥 RANK DENSE (igual que DAX)
    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }

      return {
        ...item,
        rank,
      };
    });

    // 🔥 ACUMULADO (Tiempo_Acu_FR)
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

  getTiposEstadosMantenimiento(): Record<string, string> {
    return {
      '206': 'Inspección de equipo',
      '301': 'Mp inicial/final',
      '302': 'Mantenimiento programado',
      '303': 'Mantenimiento correctivo',
    };
  }

  // =========================================
  //GRAFICO 9
  // =========================================
  procesarMetrosPorDisparoFR() {
    const mapa = new Map<
      string,
      {
        modelo_equipo: string;
        seccion: string;
        n_frentes: number;
        metros_perforados: number;
        m_disparo_fr: number;
      }
    >();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registrosArray = op.registros;

        if (!Array.isArray(registrosArray) || registrosArray.length === 0)
          return;

        const key = `${op.modelo_equipo || 'SIN_EQUIPO'}-${op.seccion || 'SIN_SECCION'}`;

        const nFrentes = this.contarFrentesCompletos(registrosArray);
        const metros = this.calcularMetrosPerforados(registrosArray);

        if (mapa.has(key)) {
          const existing = mapa.get(key)!;

          existing.n_frentes += nFrentes;
          existing.metros_perforados += metros;
        } else {
          mapa.set(key, {
            modelo_equipo: op.modelo_equipo || 'SIN_EQUIPO',
            seccion: op.seccion || 'SIN_SECCION',
            n_frentes: nFrentes,
            metros_perforados: metros,
            m_disparo_fr: 0, // se calcula después
          });
        }
      } catch (error) {}
    });

    // 🔥 cálculo FINAL estilo DAX
    for (const item of mapa.values()) {
      item.m_disparo_fr =
        item.n_frentes > 0 ? item.metros_perforados / item.n_frentes : 0;
    }

    return Array.from(mapa.values());
  }

  // =========================================
  // GRAFICO 10
  // =========================================

  procesarMhrEquipo() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      const metros = this.calcularMetrosPerforados(operativos);

      // 🔥 FIX AQUÍ
      const perc = (op as any)?.horometros?.percusion;

      const inicio = Number(perc?.inicio);
      const final = Number(perc?.final);

      let difPercusion = 0;

      if (!isNaN(inicio) && !isNaN(final)) {
        difPercusion = final - inicio;
      }

      if (!mapa.has(key)) {
        mapa.set(key, {
          modelo_equipo: key,
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

  // =========================================
  // 🔥 GRAFICO 11
  // =========================================

  procesarHorometrosJumbos() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const key = op.modelo_equipo || 'SIN_EQUIPO';

      const horo = (op as any)?.horometros;

      const diesel = horo?.diesel;
      const electrico = horo?.electrico;
      const percusion = horo?.percusion;

      const difDiesel =
        !isNaN(Number(diesel?.inicio)) && !isNaN(Number(diesel?.final))
          ? Number(diesel.final) - Number(diesel.inicio)
          : 0;

      const difElectrico =
        !isNaN(Number(electrico?.inicio)) && !isNaN(Number(electrico?.final))
          ? Number(electrico.final) - Number(electrico.inicio)
          : 0;

      const difPercusion =
        !isNaN(Number(percusion?.inicio)) && !isNaN(Number(percusion?.final))
          ? Number(percusion.final) - Number(percusion.inicio)
          : 0;

      if (!mapa.has(key)) {
        mapa.set(key, {
          modelo_equipo: key,
          diesel: 0,
          electrico: 0,
          percusion: 0,
        });
      }

      const item = mapa.get(key)!;

      item.diesel += difDiesel;
      item.electrico += difElectrico;
      item.percusion += difPercusion;
    });

    const result = Array.from(mapa.values());

    return result;
  }

  // =========================================
  // GRAFICO 12
  // =========================================

  procesarPromedioPrimeraPerfDiaFR() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha;

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let primerasHorasDelDia: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 SOLO 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        primerasHorasDelDia.push(horaDecimal);
      });

      if (primerasHorasDelDia.length === 0) return;

      const primeraHora = Math.min(...primerasHorasDelDia);

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // solo 1 valor por día
      mapaFechas.set(fecha, primeraHora);
    });

    // =========================
    // 🔥 PROMEDIO FINAL
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      let suma = 0;
      let dias = 0;

      fechasMap.forEach((hora) => {
        suma += hora;
        dias++;
      });

      const promedio = dias > 0 ? suma / dias : 0;

      //console.log(`\n🔥 ${equipo}`);
      //console.log(`días:`, dias);
      //console.log(`promedio primera perf:`, promedio);

      result.push({
        modelo_equipo: equipo,
        promedio_primera_perf_dia_fr: promedio,
      });
    }

    return result;
  }

  // =========================================
  //Grafico 13
  // =========================================

  procesarPromedioPrimeraPerfDiaFRPorFecha() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let primerasHorasDelDia: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 SOLO 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        primerasHorasDelDia.push(horaDecimal);
      });

      if (primerasHorasDelDia.length === 0) return;

      const primeraHora = Math.min(...primerasHorasDelDia);

      // =========================
      // 🔥 MAPA POR EQUIPO
      // =========================
      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // 🔥 1 valor por equipo por fecha
      mapaFechas.set(fecha, primeraHora);
    });

    // =========================
    // 🔥 FORMATO PARA GRÁFICO
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      fechasMap.forEach((hora, fecha) => {
        result.push({
          fecha,
          modelo_equipo: equipo,
          promedio_primera_perf_dia_fr: hora,
        });
      });
    }

    // 🔥 ordenar por fecha (importante para eje X)
    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // =========================================
  // Grafico 14
  // =========================================

  procesarPromedioUltimaPerfDiaFR() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let horasValidas: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 solo 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        horasValidas.push(horaDecimal);
      });

      if (horasValidas.length === 0) return;

      // 🔥 AQUÍ CAMBIA LA LÓGICA
      const ultimaHora = Math.max(...horasValidas);

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // 1 valor por día
      mapaFechas.set(fecha, ultimaHora);
    });

    // =========================
    // 🔥 PROMEDIO FINAL
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      let suma = 0;
      let dias = 0;

      fechasMap.forEach((hora) => {
        suma += hora;
        dias++;
      });

      const promedio = dias > 0 ? suma / dias : 0;

      // console.log(`\n🔥 EQUIPO: ${equipo}`);
      // console.log(`días:`, dias);
      // console.log(`promedio última perf:`, promedio);

      result.push({
        modelo_equipo: equipo,
        promedio_ultima_perf_dia_fr: promedio,
      });
    }

    return result;
  }

  // =========================================
  // Grafico 15
  // =========================================

  procesarPromedioUltimaPerfDiaFRPorFecha() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let horasValidas: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 SOLO 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        horasValidas.push(horaDecimal);
      });

      if (horasValidas.length === 0) return;

      // 🔥 CAMBIO CLAVE: última perforación
      const ultimaHora = Math.max(...horasValidas);

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // 1 valor por equipo por fecha
      mapaFechas.set(fecha, ultimaHora);
    });

    // =========================
    // 🔥 FORMATO PARA GRÁFICO
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      fechasMap.forEach((hora, fecha) => {
        result.push({
          fecha,
          modelo_equipo: equipo,
          promedio_ultima_perf_dia_fr: hora,
        });
      });
    }

    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  //=========================================
  // 🔥 GRAFICO 16
  //=========================================

  procesarLaborFR() {
    const mapa = new Map<string, Map<string, any>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const modelo = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let mejorRegistro: any = null;
      let mejorHora = Infinity;

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 buscamos la MÁS TEMPRANA
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

      // =========================
      // MAPA por modelo + fecha
      // =========================
      const key = modelo;

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // solo 1 registro por día (primera labor)
      mapaFechas.set(fecha, {
        modelo_equipo: modelo,
        fecha,
        hora_inicio: mejorRegistro.hora_inicio,
        labor_fr,
      });
    });

    // =========================
    // OUTPUT FINAL
    // =========================
    const result: any[] = [];

    for (const [, fechasMap] of mapa.entries()) {
      fechasMap.forEach((value) => {
        result.push(value);
      });
    }

    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // =========================================
  // Grafico 17
  // =========================================

  // =========================================
  // GRAFICO 18
  // =========================================

  procesarFrPorOperadorTurno() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const operador = op.operador || 'SIN_OPERADOR';
      const turno = op.turno || 'SIN_TURNO';

      const key = `${operador}-${turno}`;

      // =========================
      // 🔥 METROS PERFORADOS
      // =========================
      const metros = this.calcularMetrosPerforados(registrosArray);

      // =========================
      // 🔥 PERCUSIÓN
      // =========================
      const horo = (op as any)?.horometros;
      const percusion = horo?.percusion;

      const difPercusion =
        !isNaN(Number(percusion?.inicio)) && !isNaN(Number(percusion?.final))
          ? Number(percusion.final) - Number(percusion.inicio)
          : 0;

      // =========================
      // 🔥 MAPA
      // =========================
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

    // =========================
    // 🔥 FR FINAL (tipo DAX)
    // =========================
    for (const item of mapa.values()) {
      item.fr_mhr_hp =
        item.dif_percusion > 0
          ? item.metros_perforados / item.dif_percusion
          : 0;
    }

    return Array.from(mapa.values());
  }

  // =========================================
  // GRAFICO 22
  // =========================================

  procesarHorasNumericas() {
    const result: any[] = [];

    this.operacionesFiltradas.forEach((op) => {
      const modelo = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      registrosArray.forEach((r) => {
        // 🔥 FILTRO POR CODIGO
        const codigo = String(r?.codigo);
        if (codigo !== '101' && codigo !== '111') return;

        const horaStr = r?.hora_inicio;
        if (!horaStr) return;

        // =========================
        // 🔥 PARSE HORA
        // =========================
        const partes = horaStr.split(':').map(Number);

        const h = partes[0] || 0;
        const m = partes[1] || 0;
        const s = partes[2] || 0;

        // =========================
        // 🔥 HORA DECIMAL
        // =========================
        const hora_decimal = h + m / 60 + s / 3600;

        result.push({
          modelo_equipo: modelo,
          fecha,
          hora_inicio: horaStr,
          hora_decimal,
          codigo, // 🔥 opcional pero recomendado
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

  //GANTT
  private construirGanttDataNuevo(): void {
    const fechaMap: Record<string, any> = {};

    this.operacionesFiltradas.forEach((op) => {
      const fecha = op.fecha || 'SIN_FECHA';
      const turno = op.turno || 'SIN_TURNO';
      const equipoCodigo = `${op.equipo} - ${op.n_equipo}`;

      // 🔥 clave combinada
      const key = `${fecha}|${turno}`;

      if (!fechaMap[key]) {
        fechaMap[key] = {
          fecha,
          turno,
          equipos: {},
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

        // 🔥 MATCH CONTRA MAPA (igual que tu otro proceso)
        const estadoMatch = this.mapaEstados.get(codigo);

        // 🔥 puedes mantener estado o usar categoría (te dejo listo)
        const labor = estadoMatch?.estado_principal || estado;

        if (!fechaMap[key].equipos[equipoCodigo][labor]) {
          fechaMap[key].equipos[equipoCodigo][labor] = [];
        }

        fechaMap[key].equipos[equipoCodigo][labor].push({
          start: reg.hora_inicio,
          end: reg.hora_final,

          estado,
          description: codigo,

          // 🔥 CAMPOS ENRIQUECIDOS
          tipo_estado: estadoMatch?.tipo_estado || null,
          categoria: estadoMatch?.categoria || null,
          estado_principal: estadoMatch?.estado_principal || null,
        });

        // 🔍 debug opcional
        // if (!estadoMatch) {
        //   console.warn('❌ SIN MATCH GANTT:', codigo, reg);
        // }
      });
    });

    // 🔁 NORMALIZACIÓN FINAL
    this.ganttData = Object.values(fechaMap).map((item: any) => ({
      fecha: item.fecha,
      turno: item.turno,

      groups: Object.entries(item.equipos).map(
        ([equipoCodigo, labores]: any) => ({
          equipoCodigo,
          rows: Object.entries(labores).map(([labor, tasks]: any) => ({
            labor,
            tasks: tasks.sort((a: any, b: any) =>
              a.start.localeCompare(b.start),
            ),
          })),
        }),
      ),
    }));

    console.log('📊 GANTT DATA NUEVO:', this.ganttData);
  }

  RendimientoPorGuardia() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const guardia = op.seccion || 'SIN GUARDIA';

      const key = guardia;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          guardia,

          metrosPerforados: 0,
          horasOperativas: 0,
          rendimiento: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,

          totalTaladros: 0,
          totalBarras: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        // Solo registros operativos
        if (!this.esCodigoOperativo(codigo)) continue;

        // Si no tiene hora final, no se puede calcular duración
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const resumenMetros = this.calcularMetrosPerforadosSimba(
          registro.operacion,
        );

        item.metrosPerforados += resumenMetros.metrosPerforados;
        item.horasOperativas += horas;

        item.totalTaladros += resumenMetros.totalTaladros;
        item.totalBarras += resumenMetros.totalBarras;

        item.cantidadRegistros += 1;
        item.cantidadRegistrosOperativos += 1;
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      if (item.horasOperativas > 0) {
        item.rendimiento = Number(
          (item.metrosPerforados / item.horasOperativas).toFixed(2),
        );
      } else {
        item.rendimiento = 0;
      }

      item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));
      item.totalTaladros = Number(item.totalTaladros.toFixed(2));
      item.totalBarras = Number(item.totalBarras.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => b.rendimiento - a.rendimiento);

    return resultado;
  }

  RendimientoSimbaPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'SIMBA';
      const nEquipo = op.modelo_equipo || op.n_equipo || 'SIN EQUIPO';

      const key = nEquipo;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo,
          n_equipo: nEquipo,

          metrosPerforados: 0,
          horasOperativas: 0,
          rendimiento: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!this.esCodigoOperativo(codigo)) continue;

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const metrosRegistro = this.calcularMetrosPerforadosSimba(
          registro.operacion,
        );

        item.metrosPerforados += metrosRegistro.metrosPerforados;
        item.horasOperativas += horas;

        item.cantidadRegistros += 1;
        item.cantidadRegistrosOperativos += 1;
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      if (item.horasOperativas > 0) {
        item.rendimiento = Number(
          (item.metrosPerforados / item.horasOperativas).toFixed(2),
        );
      } else {
        item.rendimiento = 0;
      }

      item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => b.rendimiento - a.rendimiento);

    return resultado;
  }

  RendimientoPorTipoPerforacion() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!this.esCodigoOperativo(codigo)) continue;

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const operacion = registro.operacion;

        if (!operacion) continue;

        const barrasArray = operacion.barras;

        if (!Array.isArray(barrasArray)) continue;

        for (const barra of barrasArray) {
          const tipo = String(barra.tipo_perforacion || 'SIN TIPO')
            .trim()
            .toUpperCase();

          const longitud = this.convertirNumero(barra.longitud_perforacion);

          if (!resultadoMap.has(tipo)) {
            resultadoMap.set(tipo, {
              tipo,
              metrosPerforados: 0,
              horasOperativas: 0,
              rendimiento: 0,
              cantidadRegistros: 0,
            });
          }

          const item = resultadoMap.get(tipo);

          item.metrosPerforados += longitud;
          item.horasOperativas += horas;
          item.cantidadRegistros += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));
      item.rendimiento =
        item.horasOperativas > 0
          ? Number((item.metrosPerforados / item.horasOperativas).toFixed(2))
          : 0;

      return item;
    });

    resultado.sort((a, b) => b.rendimiento - a.rendimiento);

    return resultado;
  }

  // =========================================
  // KPI CARDS
  // =========================================

  calcularKpiLargo() {
    // RendimientoALL: metros / horas operativas de TODOS los datos (sin filtro fecha)
    let totalMetrosAll = 0;
    let totalHrsOpAll = 0;

    this.operacionesOriginal.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;
      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;
        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;
        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        totalMetrosAll += resumen.metrosPerforados;
        totalHrsOpAll += horas;
      }
    });

    const rendimientoAll = totalHrsOpAll > 0
      ? Number((totalMetrosAll / totalHrsOpAll).toFixed(2))
      : 0;

    // Total metros perforados del período filtrado
    let totalMetros = 0;
    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;
      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        totalMetros += resumen.metrosPerforados;
      }
    });

    // Promedio metros x día: total metros / días distintos con datos
    const fechasConDatos = new Set<string>();
    this.operacionesFiltradas.forEach((op) => {
      if (op.fecha) fechasConDatos.add(String(op.fecha));
    });
    const diasConDatos = fechasConDatos.size || 1;
    const promedioMetrosDia = Number((totalMetros / diasConDatos).toFixed(2));

    // Promedio horas operativas x día
    let totalHrsOp = 0;
    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;
      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;
        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;
        totalHrsOp += horas;
      }
    });
    const promedioHrsOperativas = Number((totalHrsOp / diasConDatos).toFixed(2));

    return {
      rendimientoAll,
      totalMetros: Number(totalMetros.toFixed(2)),
      promedioMetrosDia,
      promedioHrsOperativas,
    };
  }

  // =========================================
  // RANKING — por Operador
  // =========================================

  UtilizacionPorOperador() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const operador = String(op.operador || 'SIN OPERADOR').trim();

      if (!resultadoMap.has(operador)) {
        resultadoMap.set(operador, {
          operador,
          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          horasOperativas: 0,
          utilizacion: 0,
          cantidadOperaciones: 0,
        });
      }

      const item = resultadoMap.get(operador);
      item.cantidadOperaciones += 1;

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '').trim().toUpperCase();

        item.horasTotales += horas;

        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
        }
        if (estado === 'OPERATIVO' || this.esCodigoOperativo(codigo)) {
          item.horasOperativas += horas;
        }
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.horasDisponibles = item.horasTotales - item.horasMtto;
        item.utilizacion = item.horasDisponibles > 0
          ? Number(((item.horasOperativas / item.horasDisponibles) * 100).toFixed(2))
          : 0;
        item.horasTotales = Number(item.horasTotales.toFixed(2));
        item.horasMtto = Number(item.horasMtto.toFixed(2));
        item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));
        item.horasOperativas = Number(item.horasOperativas.toFixed(2));
        return item;
      })
      .filter((item) => item.horasTotales > 0)
      .sort((a, b) => b.utilizacion - a.utilizacion);
  }

  RendimientoPorOperador() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const operador = String(op.operador || 'SIN OPERADOR').trim();

      if (!resultadoMap.has(operador)) {
        resultadoMap.set(operador, {
          operador,
          metrosPerforados: 0,
          horasOperativas: 0,
          rendimiento: 0,
          cantidadOperaciones: 0,
        });
      }

      const item = resultadoMap.get(operador);
      item.cantidadOperaciones += 1;

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        item.metrosPerforados += resumen.metrosPerforados;
        item.horasOperativas += horas;
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        item.horasOperativas = Number(item.horasOperativas.toFixed(2));
        item.rendimiento = item.horasOperativas > 0
          ? Number((item.metrosPerforados / item.horasOperativas).toFixed(2))
          : 0;
        return item;
      })
      .filter((item) => item.rendimiento > 0)
      .sort((a, b) => b.rendimiento - a.rendimiento);
  }

  MetrosPerforadosPorGuardia() {
    // Reutiliza ProduccionPorGuardia — misma lógica
    return this.ProduccionPorGuardia();
  }

  MetrosPerforadosPorOperador() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const operador = String(op.operador || 'SIN OPERADOR').trim();
      const equipo = String(op.modelo_equipo || op.n_equipo || 'SIN EQUIPO').trim();
      const key = `${equipo}||${operador}`;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          operador,
          equipo,
          metrosPerforados: 0,
          cantidadOperaciones: 0,
        });
      }

      const item = resultadoMap.get(key);
      item.cantidadOperaciones += 1;

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        item.metrosPerforados += resumen.metrosPerforados;
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        return item;
      })
      .filter((item) => item.metrosPerforados > 0)
      .sort((a, b) => b.metrosPerforados - a.metrosPerforados);
  }

  RendimientoSimbaPorDia() {
    return this.calcularRendimientoSimbaBasePorDia(
      this.operacionesFiltradas,
      true,
    );
  }

  RendimientoSimbaPorSemana() {
    return this.calcularRendimientoSimbaPorPeriodoVisual('SEMANA');
  }

  RendimientoSimbaPorMes() {
    return this.calcularRendimientoSimbaPorPeriodoVisual('MES');
  }

  // =========================================
  // HORAS OPERATIVAS — por período
  // =========================================

  HorasOperativasPorDia() {
    const resultadoMap = new Map<string, any>();

    if (this.fechaInicio && this.fechaFin) {
      generarDiasEntreFechas(this.fechaInicio, this.fechaFin).forEach((dia) => {
        resultadoMap.set(dia.key, { key: dia.key, periodo: dia.label, horasOperativas: 0, cantidadOperaciones: 0 });
      });
    }

    this.operacionesFiltradas.forEach((op) => {
      const periodo = obtenerPeriodo(op.fecha, 'DIA');
      if (!periodo) return;
      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, { key: periodo.key, periodo: periodo.label, horasOperativas: 0, cantidadOperaciones: 0 });
      }
      const item = resultadoMap.get(periodo.key);
      item.cantidadOperaciones += 1;

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;
      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;
        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;
        item.horasOperativas += horas;
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => { item.horasOperativas = Number(item.horasOperativas.toFixed(2)); return item; })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
  }

  HorasOperativasPorSemana() {
    return this.calcularHorasOperativasPorPeriodo('SEMANA');
  }

  HorasOperativasPorMes() {
    return this.calcularHorasOperativasPorPeriodo('MES');
  }

  private calcularHorasOperativasPorPeriodo(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = new Map<string, any>();

    if (this.fechaInicio && this.fechaFin) {
      generarDiasEntreFechas(this.fechaInicio, this.fechaFin).forEach((dia) => {
        const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);
        if (!periodo || resultadoMap.has(periodo.key)) return;
        resultadoMap.set(periodo.key, { key: periodo.key, periodo: periodo.label, horasOperativas: 0, cantidadOperaciones: 0 });
      });
    }

    const datosDia = this.HorasOperativasPorDia();
    datosDia.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);
      if (!periodo || !resultadoMap.has(periodo.key)) return;
      const item = resultadoMap.get(periodo.key);
      item.horasOperativas += Number(dia.horasOperativas || 0);
      item.cantidadOperaciones += Number(dia.cantidadOperaciones || 0);
    });

    return Array.from(resultadoMap.values())
      .map((item) => { item.horasOperativas = Number(item.horasOperativas.toFixed(2)); return item; })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
  }

  // =========================================
  // YTD — acumulados anuales
  // =========================================

  YtdEquiposUtilizadosPorMes() {
    const resultadoMap = new Map<string, any>();

    if (this.fechaInicio && this.fechaFin) {
      generarDiasEntreFechas(this.fechaInicio, this.fechaFin).forEach((dia) => {
        const periodo = obtenerPeriodoDesdeKey(dia.key, 'MES');
        if (!periodo || resultadoMap.has(periodo.key)) return;
        resultadoMap.set(periodo.key, { key: periodo.key, periodo: periodo.label, equiposUtilizados: 0, equipos: new Set<string>() });
      });
    }

    this.operacionesFiltradas.forEach((op) => {
      const periodo = obtenerPeriodoDesdeKey(obtenerPeriodo(op.fecha, 'DIA')?.key || '', 'MES');
      if (!periodo) return;
      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, { key: periodo.key, periodo: periodo.label, equiposUtilizados: 0, equipos: new Set<string>() });
      }
      const item = resultadoMap.get(periodo.key);
      const equipo = String(op.modelo_equipo || op.n_equipo || '').trim();
      if (equipo) item.equipos.add(equipo);
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.equiposUtilizados = item.equipos.size;
        delete item.equipos;
        return item;
      })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
  }

  // =========================================
  // MTBF / MTTR
  // =========================================

  private calcularMtbfMttrBase(operaciones: any[]) {
    const resultadoMap = new Map<string, any>();

    operaciones.forEach((op) => {
      const key = String(op.modelo_equipo || op.n_equipo || 'SIN EQUIPO').trim();

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo: key,
          horasTotales: 0,
          horasMttoCorrectivo: 0,
          horasSinMttoCorrectivo: 0,
          fallas: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMttoCorrectivo: 0,
        });
      }

      const item = resultadoMap.get(key);

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const codigo = String(registro.codigo || '').trim();
        const estado = String(registro.estado || '').trim().toUpperCase();
        const esMtto = estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo);

        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // Mantenimiento correctivo = falla (no preventivo)
        // Usamos todos los registros de mantenimiento como fallas
        if (esMtto) {
          item.horasMttoCorrectivo += horas;
          item.fallas += 1;
          item.cantidadRegistrosMttoCorrectivo += 1;
        }
      }
    });

    return Array.from(resultadoMap.values()).map((item) => {
      item.horasSinMttoCorrectivo = item.horasTotales - item.horasMttoCorrectivo;
      item.mtbf = item.fallas > 0
        ? Number((item.horasSinMttoCorrectivo / item.fallas).toFixed(2))
        : 0;
      item.mttr = item.fallas > 0
        ? Number((item.horasMttoCorrectivo / item.fallas).toFixed(2))
        : 0;
      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMttoCorrectivo = Number(item.horasMttoCorrectivo.toFixed(2));
      item.horasSinMttoCorrectivo = Number(item.horasSinMttoCorrectivo.toFixed(2));
      return item;
    });
  }

  MtbfMttrPorEquipo() {
    return this.calcularMtbfMttrBase(this.operacionesFiltradas)
      .sort((a, b) => b.mtbf - a.mtbf);
  }

  MtbfMttrPorMes() {
    return this.calcularMtbfMttrPorPeriodo('MES');
  }

  MtbfMttrPorSemana() {
    return this.calcularMtbfMttrPorPeriodo('SEMANA');
  }

  MtbfMttrPorAno() {
    return this.calcularMtbfMttrPorPeriodo('ANO');
  }

  private calcularMtbfMttrPorPeriodo(tipo: 'SEMANA' | 'MES' | 'ANO') {
    const resultadoMap = new Map<string, any>();

    if (tipo !== 'ANO' && this.fechaInicio && this.fechaFin) {
      generarDiasEntreFechas(this.fechaInicio, this.fechaFin).forEach((dia) => {
        const periodo = obtenerPeriodoDesdeKey(dia.key, tipo as 'SEMANA' | 'MES');
        if (!periodo || resultadoMap.has(periodo.key)) return;
        resultadoMap.set(periodo.key, {
          key: periodo.key, periodo: periodo.label, anio: periodo.anio || null,
          horasTotales: 0, horasMttoCorrectivo: 0, horasSinMttoCorrectivo: 0,
          fallas: 0, cantidadRegistros: 0, cantidadRegistrosMttoCorrectivo: 0,
          mtbf: 0, mttr: 0,
        });
      });
    }

    this.operacionesFiltradas.forEach((op) => {
      const fecha = String(op.fecha || '').trim();
      if (!fecha) return;

      let periodoKey: string;
      let periodoLabel: string;
      let anio: string;

      if (tipo === 'ANO') {
        anio = fecha.split('-')[0] || '';
        periodoKey = anio;
        periodoLabel = anio;
      } else {
        const p = obtenerPeriodoDesdeKey(
          obtenerPeriodo(fecha, 'DIA')?.key || '',
          tipo as 'SEMANA' | 'MES',
        );
        if (!p) return;
        periodoKey = p.key;
        periodoLabel = p.label;
        anio = String(p.anio || '');
      }

      if (!resultadoMap.has(periodoKey)) {
        resultadoMap.set(periodoKey, {
          key: periodoKey, periodo: periodoLabel, anio,
          horasTotales: 0, horasMttoCorrectivo: 0, horasSinMttoCorrectivo: 0,
          fallas: 0, cantidadRegistros: 0, cantidadRegistrosMttoCorrectivo: 0,
          mtbf: 0, mttr: 0,
        });
      }

      const item = resultadoMap.get(periodoKey);

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (!registro.hora_inicio || !registro.hora_final) continue;
        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const codigo = String(registro.codigo || '').trim();
        const estado = String(registro.estado || '').trim().toUpperCase();
        const esMtto = estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo);

        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        if (esMtto) {
          item.horasMttoCorrectivo += horas;
          item.fallas += 1;
          item.cantidadRegistrosMttoCorrectivo += 1;
        }
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.horasSinMttoCorrectivo = item.horasTotales - item.horasMttoCorrectivo;
        item.mtbf = item.fallas > 0
          ? Number((item.horasSinMttoCorrectivo / item.fallas).toFixed(2))
          : 0;
        item.mttr = item.fallas > 0
          ? Number((item.horasMttoCorrectivo / item.fallas).toFixed(2))
          : 0;
        item.horasTotales = Number(item.horasTotales.toFixed(2));
        item.horasMttoCorrectivo = Number(item.horasMttoCorrectivo.toFixed(2));
        item.horasSinMttoCorrectivo = Number(item.horasSinMttoCorrectivo.toFixed(2));
        return item;
      })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
  }

  // =========================================
  // PRODUCCIÓN — metros perforados
  // =========================================

  ProduccionPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const key = String(op.modelo_equipo || op.n_equipo || 'SIN EQUIPO').trim();

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          n_equipo: key,
          equipo: op.equipo || 'TALADRO LARGO',
          metrosPerforados: 0,
          horasOperativas: 0,
          cantidadOperaciones: 0,
        });
      }

      const item = resultadoMap.get(key);
      item.cantidadOperaciones += 1;

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        item.metrosPerforados += resumen.metrosPerforados;
        item.horasOperativas += horas;
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        item.horasOperativas = Number(item.horasOperativas.toFixed(2));
        return item;
      })
      .filter((item) => item.metrosPerforados > 0)
      .sort((a, b) => b.metrosPerforados - a.metrosPerforados);
  }

  ProduccionPorGuardia() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const key = String(op.seccion || 'SIN GUARDIA').trim();

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          guardia: key,
          metrosPerforados: 0,
          horasOperativas: 0,
          cantidadOperaciones: 0,
        });
      }

      const item = resultadoMap.get(key);
      item.cantidadOperaciones += 1;

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        item.metrosPerforados += resumen.metrosPerforados;
        item.horasOperativas += horas;
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        item.horasOperativas = Number(item.horasOperativas.toFixed(2));
        return item;
      })
      .filter((item) => item.metrosPerforados > 0)
      .sort((a, b) => b.metrosPerforados - a.metrosPerforados);
  }

  ProduccionPorTipoPerforacion() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;

        const operacion = registro.operacion;
        if (!operacion || !Array.isArray(operacion.barras)) continue;

        for (const barra of operacion.barras) {
          const tipo = String(barra.tipo_perforacion || 'SIN TIPO').trim().toUpperCase();
          const longitud = this.convertirNumero(barra.longitud_perforacion);

          if (!resultadoMap.has(tipo)) {
            resultadoMap.set(tipo, { tipo, metrosPerforados: 0, cantidadRegistros: 0 });
          }

          const item = resultadoMap.get(tipo);
          item.metrosPerforados += longitud;
          item.cantidadRegistros += 1;
        }
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        return item;
      })
      .filter((item) => item.metrosPerforados > 0)
      .sort((a, b) => b.metrosPerforados - a.metrosPerforados);
  }

  ProduccionPorDia() {
    const resultadoMap = new Map<string, any>();

    if (this.fechaInicio && this.fechaFin) {
      generarDiasEntreFechas(this.fechaInicio, this.fechaFin).forEach((dia) => {
        resultadoMap.set(dia.key, { key: dia.key, periodo: dia.label, metrosPerforados: 0, horasOperativas: 0, cantidadOperaciones: 0 });
      });
    }

    this.operacionesFiltradas.forEach((op) => {
      const periodo = obtenerPeriodo(op.fecha, 'DIA');
      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, { key: periodo.key, periodo: periodo.label, metrosPerforados: 0, horasOperativas: 0, cantidadOperaciones: 0 });
      }

      const item = resultadoMap.get(periodo.key);
      item.cantidadOperaciones += 1;

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        item.metrosPerforados += resumen.metrosPerforados;
        item.horasOperativas += horas;
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        item.horasOperativas = Number(item.horasOperativas.toFixed(2));
        return item;
      })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
  }

  ProduccionPorSemana() {
    return this.calcularProduccionPorPeriodo('SEMANA');
  }

  ProduccionPorMes() {
    return this.calcularProduccionPorPeriodo('MES');
  }

  private calcularProduccionPorPeriodo(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = new Map<string, any>();

    if (this.fechaInicio && this.fechaFin) {
      generarDiasEntreFechas(this.fechaInicio, this.fechaFin).forEach((dia) => {
        const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);
        if (!periodo || resultadoMap.has(periodo.key)) return;
        resultadoMap.set(periodo.key, { key: periodo.key, periodo: periodo.label, metrosPerforados: 0, horasOperativas: 0, cantidadOperaciones: 0 });
      });
    }

    const datosDia = this.ProduccionPorDia();

    datosDia.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);
      if (!periodo || !resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);
      item.metrosPerforados += Number(dia.metrosPerforados || 0);
      item.horasOperativas += Number(dia.horasOperativas || 0);
      item.cantidadOperaciones += Number(dia.cantidadOperaciones || 0);
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        item.horasOperativas = Number(item.horasOperativas.toFixed(2));
        return item;
      })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
  }

  ProduccionPromedioPorDia() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const key = String(op.modelo_equipo || op.n_equipo || 'SIN EQUIPO').trim();
      const fecha = String(op.fecha || '').trim();

      if (!fecha) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          n_equipo: key,
          equipo: op.equipo || 'TALADRO LARGO',
          metrosPerforados: 0,
          fechas: new Set<string>(),
          promedioMetrosDia: 0,
          diasConDatos: 0,
        });
      }

      const item = resultadoMap.get(key);

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      let metrosTurno = 0;
      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esCodigoOperativo(codigo)) continue;
        const resumen = this.calcularMetrosPerforadosSimba(registro.operacion);
        metrosTurno += resumen.metrosPerforados;
      }

      if (metrosTurno > 0) {
        item.metrosPerforados += metrosTurno;
        item.fechas.add(fecha);
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.diasConDatos = item.fechas.size;
        item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
        item.promedioMetrosDia = item.diasConDatos > 0
          ? Number((item.metrosPerforados / item.diasConDatos).toFixed(2))
          : 0;
        delete item.fechas;
        return item;
      })
      .filter((item) => item.promedioMetrosDia > 0)
      .sort((a, b) => b.promedioMetrosDia - a.promedioMetrosDia);
  }

  DisponibilidadPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'TALADRO LARGO';

      const modeloEquipo = String(
        op.modelo_equipo || op.n_equipo || 'SIN EQUIPO',
      ).trim();

      const key = modeloEquipo;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo,
          modeloEquipo,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          disponibilidad: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasTotales > 0) {
        item.disponibilidad = Number(
          ((item.horasDisponibles / item.horasTotales) * 100).toFixed(2),
        );
      } else {
        item.disponibilidad = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => b.disponibilidad - a.disponibilidad);

    return resultado;
  }

  DisponibilidadPorDia() {
    return this.calcularDisponibilidadSimbaBasePorDia(
      this.operacionesFiltradas,
      true,
    );
  }

  DisponibilidadPorSemana() {
    return this.calcularDisponibilidadSimbaPorPeriodoVisual('SEMANA');
  }

  DisponibilidadPorMes() {
    return this.calcularDisponibilidadSimbaPorPeriodoVisual('MES');
  }

  ParetoDisponibilidad() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        const esMantenimiento =
          estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo);

        // Solo registros que afectan disponibilidad
        if (!esMantenimiento) continue;

        const actividad = this.obtenerActividadPorCodigo(codigo);

        if (!resultadoMap.has(actividad)) {
          resultadoMap.set(actividad, {
            actividad,

            horasGeneral: 0,
            paretoDispObs: 0,
            porcentajeHoras: 0,
            totalHorasGeneral: 0,

            cantidadRegistros: 0,
            codigos: new Set<string>(),
          });
        }

        const item = resultadoMap.get(actividad);

        item.horasGeneral += horas;
        item.cantidadRegistros += 1;
        item.codigos.add(codigo);
      }
    });

    let resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasGeneral = Number(item.horasGeneral.toFixed(2));
      item.codigos = Array.from(item.codigos);

      return item;
    });

    resultado.sort((a, b) => {
      if (b.horasGeneral !== a.horasGeneral) {
        return b.horasGeneral - a.horasGeneral;
      }

      return String(a.actividad).localeCompare(String(b.actividad));
    });

    const totalHorasGeneral = resultado.reduce(
      (sum, item) => sum + Number(item.horasGeneral || 0),
      0,
    );

    let acumulado = 0;

    resultado = resultado.map((item) => {
      acumulado += Number(item.horasGeneral || 0);

      item.paretoDispObs =
        totalHorasGeneral > 0
          ? Number(((acumulado / totalHorasGeneral) * 100).toFixed(2))
          : 0;

      item.porcentajeHoras =
        totalHorasGeneral > 0
          ? Number(((item.horasGeneral / totalHorasGeneral) * 100).toFixed(2))
          : 0;

      item.totalHorasGeneral = Number(totalHorasGeneral.toFixed(2));

      return item;
    });

    return resultado;
  }

  DisponibilidadPorGuardia() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const guardia = op.seccion || 'SIN GUARDIA';

      const key = guardia;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          guardia,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          disponibilidad: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasTotales > 0) {
        item.disponibilidad = Number(
          ((item.horasDisponibles / item.horasTotales) * 100).toFixed(2),
        );
      } else {
        item.disponibilidad = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => b.disponibilidad - a.disponibilidad);

    return resultado;
  }

  UtilizacionPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'TALADRO LARGO';

      const modeloEquipo = String(
        op.modelo_equipo || op.n_equipo || 'SIN EQUIPO',
      ).trim();

      const key = modeloEquipo;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo,
          modeloEquipo,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          horasOperativas: 0,
          utilizacion: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        // SUMA(HRS OPERATIVAS)
        if (estado === 'OPERATIVO' || this.esCodigoOperativo(codigo)) {
          item.horasOperativas += horas;
          item.cantidadRegistrosOperativos += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasDisponibles > 0) {
        item.utilizacion = Number(
          ((item.horasOperativas / item.horasDisponibles) * 100).toFixed(2),
        );
      } else {
        item.utilizacion = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => b.utilizacion - a.utilizacion);

    return resultado;
  }
  UtilizacionPorDia() {
    return this.calcularUtilizacionSimbaBasePorDia(
      this.operacionesFiltradas,
      true,
    );
  }

  UtilizacionPorSemana() {
    return this.calcularUtilizacionSimbaPorPeriodoVisual('SEMANA');
  }

  UtilizacionPorMes() {
    return this.calcularUtilizacionSimbaPorPeriodoVisual('MES');
  }

  UtilizacionPorGuardia() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const guardia = op.seccion || 'SIN GUARDIA';

      const key = guardia;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          guardia,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          horasOperativas: 0,
          utilizacion: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        // SUMA(HRS OPERATIVAS)
        if (estado === 'OPERATIVO' || this.esCodigoOperativo(codigo)) {
          item.horasOperativas += horas;
          item.cantidadRegistrosOperativos += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasDisponibles > 0) {
        item.utilizacion = Number(
          ((item.horasOperativas / item.horasDisponibles) * 100).toFixed(2),
        );
      } else {
        item.utilizacion = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => b.utilizacion - a.utilizacion);

    return resultado;
  }

  ParetoUtilizacion() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!codigo) continue;

        // Solo DEMORAS OPERATIVAS y DEMORAS NO OPERATIVAS
        if (!this.esDemoraPorCodigo(codigo)) continue;

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const actividad = this.obtenerActividadPorCodigo(codigo);

        if (!resultadoMap.has(actividad)) {
          resultadoMap.set(actividad, {
            actividad,

            horasDemora: 0,
            paretoAct: 0,
            porcentajeHoras: 0,
            totalHorasDemora: 0,

            cantidadRegistros: 0,
            codigos: new Set<string>(),
          });
        }

        const item = resultadoMap.get(actividad);

        item.horasDemora += horas;
        item.cantidadRegistros += 1;
        item.codigos.add(codigo);
      }
    });

    let resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDemora = Number(item.horasDemora.toFixed(2));
      item.codigos = Array.from(item.codigos);

      return item;
    });

    resultado.sort((a, b) => {
      if (b.horasDemora !== a.horasDemora) {
        return b.horasDemora - a.horasDemora;
      }

      return String(a.actividad).localeCompare(String(b.actividad));
    });

    const totalHorasDemora = resultado.reduce(
      (sum, item) => sum + Number(item.horasDemora || 0),
      0,
    );

    let acumulado = 0;

    resultado = resultado.map((item) => {
      acumulado += Number(item.horasDemora || 0);

      item.paretoAct =
        totalHorasDemora > 0
          ? Number(((acumulado / totalHorasDemora) * 100).toFixed(2))
          : 0;

      item.porcentajeHoras =
        totalHorasDemora > 0
          ? Number(((item.horasDemora / totalHorasDemora) * 100).toFixed(2))
          : 0;

      item.totalHorasDemora = Number(totalHorasDemora.toFixed(2));

      return item;
    });

    return resultado;
  }

  // =========================================
  // PARETO DETALLE — por Observación
  // =========================================

  ParetoDisponibilidadDetalle() {
    // Agrupa horas de MANTENIMIENTO por observación del registro
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        const estado = String(registro.estado || '').trim().toUpperCase();
        const esMtto = estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo);

        if (!esMtto) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const observacion = String(
          (registro.operacion as any)?.observaciones ||
          ''
        ).trim();

        // Si no hay observación, usar la actividad del código como fallback
        const label = observacion || this.obtenerActividadPorCodigo(codigo) || `COD ${codigo}` || 'SIN OBSERVACIÓN';

        if (!resultadoMap.has(label)) {
          resultadoMap.set(label, {
            observacion: label,
            horasTotales: 0,
            cantidadRegistros: 0,
            codigosRelacionados: new Set<string>(),
          });
        }

        const item = resultadoMap.get(label);
        item.horasTotales += horas;
        item.cantidadRegistros += 1;
        if (codigo) item.codigosRelacionados.add(codigo);
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.horasTotales = Number(item.horasTotales.toFixed(2));
        item.codigosRelacionados = Array.from(item.codigosRelacionados);
        return item;
      })
      .sort((a, b) => b.horasTotales - a.horasTotales);
  }

  ParetoUtilizacionDetalle() {
    // Agrupa horas de DEMORA por observación del registro
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        if (!this.esDemoraPorCodigo(codigo)) continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(registro.hora_inicio, registro.hora_final);
        if (!horas || horas <= 0) continue;

        const observacion = String(
          (registro.operacion as any)?.observaciones ||
          'SIN OBSERVACIÓN'
        ).trim() || 'SIN OBSERVACIÓN';

        const actividad = this.obtenerActividadPorCodigo(codigo);
        const tipoDemora = this.obtenerTipoDemora(codigo);

        if (!resultadoMap.has(observacion)) {
          resultadoMap.set(observacion, {
            observacion,
            descripcion: observacion,
            horasDemora: 0,
            cantidadRegistros: 0,
            tipoDemora,
            codigos: new Set<string>(),
          });
        }

        const item = resultadoMap.get(observacion);
        item.horasDemora += horas;
        item.cantidadRegistros += 1;
        if (codigo) item.codigos.add(codigo);
      }
    });

    return Array.from(resultadoMap.values())
      .map((item) => {
        item.horasDemora = Number(item.horasDemora.toFixed(2));
        item.codigos = Array.from(item.codigos);
        return item;
      })
      .sort((a, b) => b.horasDemora - a.horasDemora);
  }

  private obtenerTipoDemora(codigo: string): string {
    const estado = this.mapaEstados.get(String(codigo || '').trim());
    if (!estado) return 'DEMORA';
    const familia = this.normalizarTexto(estado.categoria);
    if (familia.includes('NO OPERATIVA')) return 'NO OPERATIVA';
    if (familia.includes('OPERATIVA')) return 'OPERATIVA';
    return 'DEMORA';
  }

  private obtenerActividadPorCodigo(codigo: string): string {
    const estado = this.mapaEstados.get(String(codigo || '').trim());

    if (!estado) return `COD ${codigo}`;

    return (
      estado.tipo_estado ||
      estado.categoria ||
      estado.estado_principal ||
      `COD ${codigo}`
    );
  }

  private calcularUtilizacionSimbaBasePorDia(
    dataOperaciones: any[],
    crearRangoVisual: boolean,
  ) {
    const resultadoMap = new Map<string, any>();

    if (crearRangoVisual && this.fechaInicio && this.fechaFin) {
      const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

      diasRango.forEach((dia) => {
        resultadoMap.set(dia.key, {
          key: dia.key,
          periodo: dia.label,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          horasOperativas: 0,
          utilizacion: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,
          cantidadRegistrosMtto: 0,
        });
      });
    }

    dataOperaciones.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      const fecha = op.fecha;

      if (!fecha) return;

      const periodo = obtenerPeriodo(fecha, 'DIA');

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, {
          key: periodo.key,
          periodo: periodo.label,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          horasOperativas: 0,
          utilizacion: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        // SUMA(HRS OPERATIVAS)
        if (estado === 'OPERATIVO' || this.esCodigoOperativo(codigo)) {
          item.horasOperativas += horas;
          item.cantidadRegistrosOperativos += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasDisponibles > 0) {
        item.utilizacion = Number(
          ((item.horasOperativas / item.horasDisponibles) * 100).toFixed(2),
        );
      } else {
        item.utilizacion = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }
  private calcularUtilizacionSimbaPorPeriodoVisual(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = this.crearPeriodosVisiblesUtilizacionSimba(tipo);

    const dataCalculo = this.operacionesOriginal;

    dataCalculo.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      const fecha = op.fecha;

      if (!fecha) return;

      const periodo = obtenerPeriodoDesdeKey(fecha, tipo);

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        // SUMA(HRS OPERATIVAS)
        if (estado === 'OPERATIVO' || this.esCodigoOperativo(codigo)) {
          item.horasOperativas += horas;
          item.cantidadRegistrosOperativos += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasDisponibles > 0) {
        item.utilizacion = Number(
          ((item.horasOperativas / item.horasDisponibles) * 100).toFixed(2),
        );
      } else {
        item.utilizacion = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }

  private crearPeriodosVisiblesUtilizacionSimba(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = new Map<string, any>();

    if (!this.fechaInicio || !this.fechaFin) {
      return resultadoMap;
    }

    const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

    diasRango.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, {
          key: periodo.key,
          periodo: periodo.label,
          anio: periodo.anio || null,
          fechaInicio: periodo.fechaInicio || null,
          fechaFin: periodo.fechaFin || null,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          horasOperativas: 0,
          utilizacion: 0,

          cantidadDiasRango: 0,
          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);
      item.cantidadDiasRango += 1;
    });

    return resultadoMap;
  }

  private calcularDisponibilidadSimbaBasePorDia(
    dataOperaciones: any[],
    crearRangoVisual: boolean,
  ) {
    const resultadoMap = new Map<string, any>();

    if (crearRangoVisual && this.fechaInicio && this.fechaFin) {
      const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

      diasRango.forEach((dia) => {
        resultadoMap.set(dia.key, {
          key: dia.key,
          periodo: dia.label,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          disponibilidad: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMtto: 0,
        });
      });
    }

    dataOperaciones.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      const fecha = op.fecha;

      if (!fecha) return;

      const periodo = obtenerPeriodo(fecha, 'DIA');

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, {
          key: periodo.key,
          periodo: periodo.label,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          disponibilidad: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasTotales > 0) {
        item.disponibilidad = Number(
          ((item.horasDisponibles / item.horasTotales) * 100).toFixed(2),
        );
      } else {
        item.disponibilidad = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }

  private calcularDisponibilidadSimbaPorPeriodoVisual(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = this.crearPeriodosVisiblesDisponibilidadSimba(tipo);

    const dataCalculo = this.operacionesOriginal;

    dataCalculo.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      const fecha = op.fecha;

      if (!fecha) return;

      const periodo = obtenerPeriodoDesdeKey(fecha, tipo);

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasTotales > 0) {
        item.disponibilidad = Number(
          ((item.horasDisponibles / item.horasTotales) * 100).toFixed(2),
        );
      } else {
        item.disponibilidad = 0;
      }

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }

  private crearPeriodosVisiblesDisponibilidadSimba(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = new Map<string, any>();

    if (!this.fechaInicio || !this.fechaFin) {
      return resultadoMap;
    }

    const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

    diasRango.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, {
          key: periodo.key,
          periodo: periodo.label,
          anio: periodo.anio || null,
          fechaInicio: periodo.fechaInicio || null,
          fechaFin: periodo.fechaFin || null,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          disponibilidad: 0,

          cantidadDiasRango: 0,
          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMtto: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);
      item.cantidadDiasRango += 1;
    });

    return resultadoMap;
  }

  private calcularRendimientoSimbaBasePorDia(
    dataOperaciones: any[],
    crearRangoVisual: boolean,
  ) {
    const resultadoMap = new Map<string, any>();

    if (crearRangoVisual && this.fechaInicio && this.fechaFin) {
      const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

      diasRango.forEach((dia) => {
        resultadoMap.set(dia.key, {
          key: dia.key,
          periodo: dia.label,

          metrosPerforados: 0,
          horasOperativas: 0,
          rendimiento: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,

          totalTaladros: 0,
          totalBarras: 0,
        });
      });
    }

    dataOperaciones.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      const fecha = op.fecha;

      if (!fecha) return;

      const periodo = obtenerPeriodo(fecha, 'DIA');

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, {
          key: periodo.key,
          periodo: periodo.label,

          metrosPerforados: 0,
          horasOperativas: 0,
          rendimiento: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,

          totalTaladros: 0,
          totalBarras: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!this.esCodigoOperativo(codigo)) continue;

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const resumenMetros = this.calcularMetrosPerforadosSimba(
          registro.operacion,
        );

        item.metrosPerforados += resumenMetros.metrosPerforados;
        item.horasOperativas += horas;

        item.totalTaladros += resumenMetros.totalTaladros;
        item.totalBarras += resumenMetros.totalBarras;

        item.cantidadRegistros += 1;
        item.cantidadRegistrosOperativos += 1;
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      if (item.horasOperativas > 0) {
        item.rendimiento = item.metrosPerforados / item.horasOperativas;
      } else {
        item.rendimiento = 0;
      }
      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }
  private calcularRendimientoSimbaPorPeriodoVisual(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = this.crearPeriodosVisiblesRendimientoSimba(tipo);

    const dataCalculo = this.operacionesOriginal;

    const datosPorDia = this.calcularRendimientoSimbaBasePorDia(
      dataCalculo,
      false,
    );

    datosPorDia.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);

      item.metrosPerforados += Number(dia.metrosPerforados || 0);
      item.horasOperativas += Number(dia.horasOperativas || 0);

      item.totalTaladros += Number(dia.totalTaladros || 0);
      item.totalBarras += Number(dia.totalBarras || 0);

      item.cantidadOperaciones += Number(dia.cantidadOperaciones || 0);
      item.cantidadRegistros += Number(dia.cantidadRegistros || 0);
      item.cantidadRegistrosOperativos += Number(
        dia.cantidadRegistrosOperativos || 0,
      );

      if (dia.horasOperativas > 0) {
        item.cantidadDiasConDatos += 1;
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      if (item.horasOperativas > 0) {
        item.rendimiento = Number(
          (item.metrosPerforados / item.horasOperativas).toFixed(2),
        );
      } else {
        item.rendimiento = 0;
      }

      item.metrosPerforados = Number(item.metrosPerforados.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));
      item.totalTaladros = Number(item.totalTaladros.toFixed(2));
      item.totalBarras = Number(item.totalBarras.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }

  private crearPeriodosVisiblesRendimientoSimba(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = new Map<string, any>();

    if (!this.fechaInicio || !this.fechaFin) {
      return resultadoMap;
    }

    const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

    diasRango.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, {
          key: periodo.key,
          periodo: periodo.label,
          anio: periodo.anio || null,
          fechaInicio: periodo.fechaInicio || null,
          fechaFin: periodo.fechaFin || null,

          metrosPerforados: 0,
          horasOperativas: 0,
          rendimiento: 0,

          cantidadDiasRango: 0,
          cantidadDiasConDatos: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,

          totalTaladros: 0,
          totalBarras: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);
      item.cantidadDiasRango += 1;
    });

    return resultadoMap;
  }

  private calcularMetrosPerforadosSimba(operacion: any): {
    metrosPerforados: number;
    totalTaladros: number;
    totalBarras: number;
  } {
    if (!operacion) {
      return {
        metrosPerforados: 0,
        totalTaladros: 0,
        totalBarras: 0,
      };
    }

    const barrasArray = operacion.barras;

    if (!Array.isArray(barrasArray)) {
      return {
        metrosPerforados: 0,
        totalTaladros: 0,
        totalBarras: 0,
      };
    }

    let metrosPerforados = 0;
    let totalTaladros = 0;
    let totalBarras = 0;

    for (const barra of barrasArray) {
      const longitudPerforacion = this.convertirNumero(barra.longitud_perforacion);
      const nTaladro = this.convertirNumero(barra.n_taladro);
      const nBarras = this.convertirNumero(barra.n_barras);

      metrosPerforados += longitudPerforacion;

      totalTaladros += nTaladro;
      totalBarras += nBarras;
    }

    return {
      metrosPerforados,
      totalTaladros,
      totalBarras,
    };
  }
  private convertirNumero(valor: any, valorDefault: number = 0): number {
    if (valor === null || valor === undefined || valor === '') {
      return valorDefault;
    }

    const numero = Number(valor);

    return isNaN(numero) ? valorDefault : numero;
  }

  private esDemoraPorCodigo(codigo: string): boolean {
    const estado = this.mapaEstados.get(codigo);

    if (!estado) return false;

    const categoria = this.normalizarTexto(estado.categoria);
    const estadoPrincipal = this.normalizarTexto(estado.estado_principal);

    return categoria.includes('DEMORA') || estadoPrincipal.includes('DEMORA');
  }
  private esCodigoOperativo(codigo: string): boolean {
    const estado = this.obtenerEstadoPorCodigo(codigo);

    if (!estado) return false;

    const estadoPrincipal = this.normalizarTexto(estado.estado_principal);
    const categoria = this.normalizarTexto(estado.categoria);

    return (
      estadoPrincipal === 'OPERATIVO' ||
      categoria.includes('ACTIVIDADES OPERATIVAS')
    );
  }
  private esCodigoMantenimiento(codigo: string): boolean {
    const estado = this.obtenerEstadoPorCodigo(codigo);

    if (!estado) return false;

    const estadoPrincipal = this.normalizarTexto(estado.estado_principal);
    const categoria = this.normalizarTexto(estado.categoria);

    return (
      estadoPrincipal === 'MANTENIMIENTO' || categoria.includes('MANTENIMIENTO')
    );
  }
  private obtenerEstadoPorCodigo(codigo: string) {
    return this.mapaEstados.get(String(codigo || '').trim());
  }
  private normalizarTexto(valor: any): string {
    return String(valor || '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
