import { PresentacionMmtoEmpernadorComponent } from '../presentacion-mmto-empernador/presentacion-mmto-empernador.component';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { OperacionBaseSostenimiento } from '../../../../../models/OperacionBase.models';
import { PlanProduccion } from '../../../../../models/plan_produccion.model';
import { PlanProduccionService } from '../../../../../services/plan-produccion.service';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';
import jsPDF from 'jspdf';
import {
  configurarCabeceraPDF,
  agregarCabeceraPDF,
  agregarPaginaGraficos2x2,
  agregarGraficoEchartsPDFProporcional,
  agregarTablaContinuaPDF,
} from 'src/app/config/config-pdf';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanMensualService } from '../../../../../services/plan-mensual.service';
import { HorasPrimeraPerforacionComponent } from '../Graficos components/Hoja 2/horas-primera-perforacion/horas-primera-perforacion.component';
import { DetalleEquipoComponent } from '../Graficos components/Hoja 2/detalle-equipo/detalle-equipo.component';
import { DetalleSostenimientoComponent } from '../Graficos components/Hoja 2/detalle-sostenimiento/detalle-sostenimiento.component';
import { MejoresOperadoresComponent } from '../Graficos components/Hoja 2/mejores-operadores/mejores-operadores.component';
import { ObservacionesComponent } from '../Graficos components/Hoja 2/observaciones/observaciones.component';
import { SchedulerComponent } from '../../Linea de tiempo/scheduler/scheduler.component';
import { EstadoService } from '../../../../../services/estado.service';
import { OperacionSostenimiento } from '../../../../../models/OperacionSostenimiento';
import { ExcelEmpernadorExportService } from 'app/services/Excel/excel-empernador-export.service';
import { PresentacionGefeGuardiaEmpernadorComponent } from '../presentacion-gefe-guardia-empernador/presentacion-gefe-guardia-empernador.component';
import { MatDialog } from '@angular/material/dialog';
import { Equipo } from 'app/models/equipo.model';
import { EquipoService } from 'app/services/equipo.service';
import { IndicadorPowerBiComponent } from './indicador-power-bi.component';
import { construirIndicadoresSostenimiento, construirRankingOperadoresSostenimiento, obtenerHorasHorometroSostenimiento } from './sostenimiento-indicadores.builder';
import { IndicadorPagina, IndicadorGrafico } from './sostenimiento-indicadores.model';
import { DashboardLoadingComponent } from '../../shared/dashboard-loading/dashboard-loading.component';

@Component({
  selector: 'app-principal-grafico-sostenimiento',
  imports: [
    CommonModule,
    FormsModule,
    HorasPrimeraPerforacionComponent,
    DetalleEquipoComponent,
    DetalleSostenimientoComponent,
    MejoresOperadoresComponent,
    ObservacionesComponent,
    SchedulerComponent,
    IndicadorPowerBiComponent,
    DashboardLoadingComponent,
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
  equipoSeleccionado = '';
  seccionSeleccionada = '';
  equiposFiltro: string[] = [];
  seccionesFiltro: string[] = [];
  cargandoPDF = false;
  errorPDF = '';
  cargando = false;
  errorCarga = '';

  @ViewChildren(IndicadorPowerBiComponent)
  indicadoresGraficos!: QueryList<IndicadorPowerBiComponent>;

  //HOJA 2
  dataProcesoLaborFR: any[] = [];
  dataIndicadores: any[] = [];
  dataIndicadoresLabor: any[] = [];
  dataFrPorOperadorTurno: any[] = [];
  dataLaborFRDetallado: any[] = [];

  equipos: Equipo[] = [];
    private readonly PROCESO = 'EMPERNADOR';

  estadosProceso: any[] = [];
  ganttData: any[] = [];
  vistaPrincipal: boolean = true;
  paginaSeleccionada = 'Disponibilidad';
  indicadoresPowerBi: IndicadorPagina[] = [];
  resumenTarjetas: NonNullable<IndicadorGrafico['resumen']> = [];

  constructor(
    private planMensualService: PlanMensualService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService,
    private excelExportService: ExcelEmpernadorExportService,
    private dialog: MatDialog,
    private equipoService: EquipoService,
    private changeDetector: ChangeDetectorRef,
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
    this.cargarEquipos();
  }

      cargarEquipos() {
  this.equipoService.getEquiposByProceso(this.PROCESO)
    .subscribe({
      next: (equipos: Equipo[]) => {
        this.equipos = equipos;
        this.actualizarOpcionesFiltro();
      },
      error: err => console.error('Error equipos:', err)
    });
}

  obtenerEstadosPorProceso(proceso: string) {
    this.estadoService.getEstadosByProceso(proceso)
      .subscribe({
        next: (data) => {
          this.estadosProceso = data;
          this.construirMapaEstados();
          this.procesarTodo();
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
    this.cargando = true;
    this.errorCarga = '';

    this.operacionesService.getAllAprobados<OperacionSostenimiento>(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginal = resp.data;
        this.actualizarOpcionesFiltro();
        console.log('🔥 DATA OPERACIONES:', this.operacionesOriginal);
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.errorCarga = 'No se pudieron cargar las operaciones de sostenimiento.';
        //console.error('❌ Error al obtener operaciones:', err);
      },
    });
  }

  private actualizarOpcionesFiltro(): void {
    this.equiposFiltro = Array.from(new Set(this.equipos
      .filter(equipo => equipo.proceso?.trim().toUpperCase() === this.PROCESO)
      .map(equipo => equipo.codigo?.trim() || '')
      .filter(Boolean))).sort();
    this.seccionesFiltro = Array.from(new Set(
      this.operacionesOriginal.map((op) => op.seccion || 'SIN_SECCION'),
    )).sort();
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
    this.indicadoresPowerBi = construirIndicadoresSostenimiento(
      this.operacionesFiltradas,
      this.planesMensuales,
      this.estadosProceso,
    );
    this.resumenTarjetas = this.indicadoresPowerBi
      .flatMap(pagina => pagina.graficos)
      .find(grafico => grafico.tipo === 'summary')?.resumen || [];
    this.dataProcesoLaborFR = this.procesarLaborFR();
    this.dataIndicadores = this.procesarIndicadores();
    this.dataIndicadoresLabor = this.procesarIndicadoresPorLabor();
    this.dataFrPorOperadorTurno = this.procesarFrPorOperadorTurno();
    this.dataLaborFRDetallado = this.procesarLaborFRDetallado();

    this.construirGanttDataNuevo();
  }

  seleccionarPagina(nombre: string): void {
    this.paginaSeleccionada = nombre;
  }

  get paginaActualPowerBi(): IndicadorPagina | undefined {
    return this.indicadoresPowerBi.find(
      (pagina) => pagina.nombre === this.paginaSeleccionada,
    );
  }

  get graficosPaginaActual(): IndicadorPagina['graficos'] {
    const pagina = this.paginaActualPowerBi;
    if (!pagina) return [];
    return this.graficosVisibles(pagina).filter(grafico => grafico.tipo !== 'summary');
  }

  private graficosVisibles(pagina: IndicadorPagina): IndicadorPagina['graficos'] {
    if (pagina.nombre !== 'Utilización' || !this.turnoAplicado) {
      return pagina.graficos;
    }
    const turno = this.turnoAplicado === 'DÍA' ? 'día' : 'noche';
    return pagina.graficos.filter(
      (grafico) => grafico.tipo !== 'scatter' || grafico.unidad === turno,
    );
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
      const equipo = String(op.n_equipo || '').trim();
      if (this.equipoSeleccionado && equipo !== this.equipoSeleccionado) return false;
      const seccion = op.seccion || 'SIN_SECCION';
      if (this.seccionSeleccionada && seccion !== this.seccionSeleccionada) return false;

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
    this.equipoSeleccionado = '';
    this.seccionSeleccionada = '';

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
  private getPernos(opReg: any): any[] {
    const pernos = opReg?.perno
      ? (Array.isArray(opReg.perno) ? opReg.perno : [opReg.perno])
      : [];
    const validos = pernos.filter((perno: any) =>
      perno && (
        String(perno.tipo_pernos ?? '').trim() !== '' ||
        this.toNumber(perno.log_pernos) > 0 ||
        this.toNumber(perno.n_pernos_instalados) > 0
      )
    );

    if (validos.length) return validos;
    if (!opReg || !(
      opReg.tipo_pernos || opReg.log_pernos || opReg.n_pernos_instalados
    )) return [];

    return [{
      tipo_pernos: opReg.tipo_pernos,
      log_pernos: opReg.log_pernos,
      n_pernos_instalados: opReg.n_pernos_instalados,
      sistematico_puntual: opReg.sistematico_puntual,
    }];
  }

  private getMallas(opReg: any): any[] {
    const mallas = opReg?.malla
      ? (Array.isArray(opReg.malla) ? opReg.malla : [opReg.malla])
      : [];
    const validas = mallas.filter((malla: any) =>
      malla && (
        String(malla.tipo_malla ?? '').trim() !== '' ||
        this.toNumber(malla.mt52_malla) > 0
      )
    );

    if (validas.length) return validas;
    if (!opReg || !(opReg.tipo_malla || opReg.mt52_malla)) return [];
    return [{ tipo_malla: opReg.tipo_malla, mt52_malla: opReg.mt52_malla }];
  }

  private getPerforaciones(opReg: any): any[] {
    const perforaciones = opReg?.perforacion
      ? (Array.isArray(opReg.perforacion) ? opReg.perforacion : [opReg.perforacion])
      : [];
    return perforaciones.filter((perforacion: any) =>
      perforacion && (
        String(perforacion.tipo_perforacion ?? '').trim() !== '' ||
        this.toNumber(perforacion.n_taladros) > 0 ||
        this.toNumber(perforacion.longitud_perforacion) > 0
      )
    );
  }

  private toNumber(value: unknown): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  private nombreEquipoGrafico(op: OperacionBaseSostenimiento): string {
    return String(op.n_equipo || 'SIN_EQUIPO').trim();
  }

  private getNPernos(opReg: any): number {
    return this.getPernos(opReg).reduce(
      (total, perno) => total + this.toNumber(perno.n_pernos_instalados),
      0,
    );
  }

  private getLogPernos(opReg: any): number {
    const pernos = this.getPernos(opReg)
      .map((perno) => this.toNumber(perno.log_pernos))
      .filter((longitud) => longitud > 0);
    return pernos.length
      ? pernos.reduce((total, longitud) => total + longitud, 0) / pernos.length
      : 0;
  }

  async generarPDF(): Promise<void> {
    if (this.cargando || this.cargandoPDF) return;
    this.errorPDF = '';
    this.cargandoPDF = true;
    const paginaInicial = this.paginaSeleccionada;
    const vistaInicial = this.vistaPrincipal;

    try {
      this.vistaPrincipal = true;
      configurarCabeceraPDF({
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        turno: this.turnoAplicado || null,
        tipoOperacion: 'Sostenimiento — Empernador',
      });

      const opts = {
        pixelRatio: 2,
        exportWidth: 900,
        exportHeight: 520,
      };

      type ElementoPdf =
        | { tipo: 'grafico'; titulo: string; imagen: string }
        | {
            tipo: 'tabla';
            titulo: string;
            columnas: string[];
            filas: Record<string, string | number>[];
          };
      const paginasCapturadas: {
        nombre: string;
        elementos: ElementoPdf[];
      }[] = [];
      const agregarTabla = (
        elementos: ElementoPdf[],
        titulo: string,
        columnas: string[],
        filas: Record<string, string | number>[],
      ): void => {
        elementos.push({
          tipo: 'tabla',
          titulo,
          columnas,
          filas: filas.length ? filas : [{ [columnas[0] || 'Estado']: 'Sin datos para los filtros seleccionados.' }],
        });
      };
      for (const pagina of this.indicadoresPowerBi) {
        this.paginaSeleccionada = pagina.nombre;
        this.changeDetector.detectChanges();
        await this.delay(400);
        const componentes = this.indicadoresGraficos?.toArray() || [];
        const graficosVisibles = this.graficosVisibles(pagina);
        const elementos = graficosVisibles.flatMap((grafico): ElementoPdf[] => {
          if (grafico.tipo === 'table') {
            return [{
              tipo: 'tabla',
              titulo: grafico.titulo,
              columnas: grafico.columnas || [],
              filas: grafico.filas || [],
            }];
          }
          if (grafico.tipo === 'summary') {
            return [{
              tipo: 'tabla',
              titulo: grafico.titulo,
              columnas: ['Indicador', 'Valor', 'Unidad'],
              filas: (grafico.resumen || []).map((item) => ({
                Indicador: item.nombre,
                Valor: item.valor,
                Unidad: item.unidad || '',
              })),
            }];
          }
          const tieneDatos = grafico.tipo === 'gauge' ||
            (grafico.categorias?.length || 0) > 0 ||
            (grafico.puntos?.length || 0) > 0;
          if (!tieneDatos) {
            return [{
              tipo: 'tabla',
              titulo: grafico.titulo,
              columnas: ['Estado'],
              filas: [{ Estado: 'No hay datos para los filtros seleccionados.' }],
            }];
          }
          const componente = componentes.find(item => item.grafico === grafico);
          const imagen = componente?.getChartImage(opts);
          if (!imagen) {
            throw new Error(`No se pudo capturar el gráfico "${grafico.titulo}" para el PDF.`);
          }
          return [{ tipo: 'grafico', titulo: grafico.titulo, imagen }];
        });

        if (pagina.nombre === 'Producción') {
          const primeraPerforacion = this.dataProcesoLaborFR.map((item) => {
            const hora = String(item.hora_inicio || item.hora || '');
            const partes = hora.split(':');
            const horaFormateada = hora
              ? `${(partes[0] || '0').padStart(2, '0')}:${(partes[1] || '0').padStart(2, '0')}`
              : '--:--';
            return {
              Equipo: item.modelo_equipo || 'N/A',
              Labor: item.labor_fr || item.seccion_labor || item.seccion || 'N/A',
              Hora: horaFormateada,
            };
          });
          agregarTabla(elementos, 'Hora de Primera Perforación por Equipo',
            ['Equipo', 'Labor', 'Hora'], primeraPerforacion);

          const detalleEquipo: Record<string, string | number>[] = this.dataIndicadores.map((item) => ({
            Equipo: item.modelo_equipo || 'N/A',
            'Hs. Percutadas': Number(item.diferencia_percusion) || 0,
            'N° Pernos': Number(item.n_pernos) || 0,
            'Long Pernos': Number(item.log_pernos) || 0,
            'N° Labores': Number(item.n_labores_sostenidas) || 0,
            'Pernos/Labor': Number(item.n_pernos_por_labor) || 0,
            'M/Hr': Number(item.sos_m_hr_hp) || 0,
            'Metros Perf.': Number(item.metros_perforados) || 0,
          }));
          const cantidadEquipos = detalleEquipo.length || 1;
          const totalCampo = (campo: string) =>
            detalleEquipo.reduce((total, fila) => total + Number(fila[campo] || 0), 0);
          if (detalleEquipo.length) {
            detalleEquipo.push({
              Equipo: 'Total/Promedio',
              'Hs. Percutadas': totalCampo('Hs. Percutadas'),
              'N° Pernos': totalCampo('N° Pernos'),
              'Long Pernos': totalCampo('Long Pernos') / cantidadEquipos,
              'N° Labores': totalCampo('N° Labores'),
              'Pernos/Labor': totalCampo('Pernos/Labor') / cantidadEquipos,
              'M/Hr': totalCampo('M/Hr') / cantidadEquipos,
              'Metros Perf.': totalCampo('Metros Perf.'),
            });
          }
          agregarTabla(elementos, 'Detalle por Equipo',
            ['Equipo', 'Hs. Percutadas', 'N° Pernos', 'Long Pernos', 'N° Labores', 'Pernos/Labor', 'M/Hr', 'Metros Perf.'],
            detalleEquipo);

          const detalleSostenimiento: Record<string, string | number>[] = this.dataIndicadoresLabor.map((item) => ({
            Registros: Number(item.registros) || 1,
            Equipo: item.modelo_equipo || 'N/A',
            Labor: item.labor_sos || 'N/A',
            'Tipo Pernos': item.tipo_pernos || 'N/A',
            'N° Pernos': Number(item.n_pernos) || 0,
            'Long Pernos': Number(item.log_pernos) || 0,
            Malla: Number(item.mt52_malla) || 0,
            'Metros Perf.': Number(item.metros_perforados) || 0,
          }));
          const filasSostenimiento = detalleSostenimiento.length || 1;
          const totalSostenimiento = (campo: string) =>
            detalleSostenimiento.reduce((total, fila) => total + Number(fila[campo] || 0), 0);
          if (detalleSostenimiento.length) {
            detalleSostenimiento.push({
              Registros: 'Total',
              Equipo: '',
              Labor: '',
              'Tipo Pernos': '',
              'N° Pernos': totalSostenimiento('N° Pernos'),
              'Long Pernos': totalSostenimiento('Long Pernos') / filasSostenimiento,
              Malla: totalSostenimiento('Malla'),
              'Metros Perf.': totalSostenimiento('Metros Perf.'),
            });
          }
          agregarTabla(elementos, 'Detalle de Sostenimiento',
            ['Registros', 'Equipo', 'Labor', 'Tipo Pernos', 'N° Pernos', 'Long Pernos', 'Malla', 'Metros Perf.'],
            detalleSostenimiento);
        }

        if (pagina.nombre === 'Ranking') {
          const mejoresOperadores = [...this.dataFrPorOperadorTurno]
            .sort((a, b) => Number(b.rendimiento || 0) - Number(a.rendimiento || 0))
            .map((item, index) => ({
              '#': index + 1,
              Operador: item.operador || item.nombre_operador || 'N/A',
              Turno: item.turno || 'DÍA',
              'Pernos/h': Number(item.rendimiento) || 0,
              'Pernos': Number(item.pernos_instalados) || 0,
            }));
          agregarTabla(elementos, 'Mejores Operadores',
            ['#', 'Operador', 'Turno', 'Pernos/h', 'Pernos'], mejoresOperadores);

          const observaciones = this.dataLaborFRDetallado.map((item) => ({
            Operador: item.operador || item.nombre_operador || 'N/A',
            Equipo: item.equipo || item.modelo_equipo || 'N/A',
            Labor: item.labor || item.labor_fr || item.seccion_labor || '',
            Observación: item.observacion || item.observaciones || item.descripcion || '',
          }));
          agregarTabla(elementos, 'Observaciones',
            ['Operador', 'Equipo', 'Labor', 'Observación'], observaciones);
        }

        paginasCapturadas.push({
          nombre: pagina.nombre,
          elementos,
        });
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      pdf.deletePage(1);

      for (const pagina of paginasCapturadas) {
        const tituloCabecera = `SOSTENIMIENTO — ${pagina.nombre.toUpperCase()}`;
        let bloqueGraficos: { img: string; titulo: string }[] = [];
        const exportarBloqueGraficos = (): void => {
          if (!bloqueGraficos.length) return;
          agregarPaginaGraficos2x2(pdf, tituloCabecera, bloqueGraficos);
          bloqueGraficos = [];
        };

        for (const elemento of pagina.elementos) {
          if (elemento.tipo === 'grafico') {
            bloqueGraficos.push({ img: elemento.imagen, titulo: elemento.titulo });
            if (bloqueGraficos.length === 4) exportarBloqueGraficos();
            continue;
          }

          exportarBloqueGraficos();
          pdf.addPage([297, 210], 'landscape');
          const startY = agregarCabeceraPDF(pdf, tituloCabecera);
          agregarTablaContinuaPDF(pdf, {
            titulo: elemento.titulo,
            columnas: elemento.columnas.map((columna) => ({
              header: columna,
              dataKey: columna,
            })),
            filas: elemento.filas,
            startY: startY + 7,
          }, tituloCabecera);
        }
        exportarBloqueGraficos();
      }

      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`sostenimiento-empernador-${fecha}.pdf`);

    } catch (error) {
      console.error('Error al exportar el PDF de sostenimiento:', error);
      this.errorPDF = 'No se pudo generar el PDF. Intenta exportarlo nuevamente.';
    } finally {
      this.paginaSeleccionada = paginaInicial;
      this.vistaPrincipal = vistaInicial;
      this.cargandoPDF = false;
      this.changeDetector.detectChanges();
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

      const op = registro.operacion || registro;
      for (const perno of this.getPernos(op)) {
        const nPernos = this.toNumber(perno.n_pernos_instalados);
        const longitud = this.toNumber(perno.log_pernos);
        if (nPernos > 0 && longitud > 0) {
          totalMetros += nPernos * longitud * 0.3048;
        }
      }
    }

    return totalMetros;
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
      const equipoKey = `${op.equipo}-${op.n_equipo}`;
      const modeloEquipo = this.nombreEquipoGrafico(op);
      const seccion = op.seccion || 'SIN_SECCION';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (registro.estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        // 🔥 CAMBIO NUEVO FORMATO
        const seccionLabor = this.obtenerSeccionLabor(opReg, mapaPlanes);
        for (const perno of this.getPernos(opReg)) {
          const tipoPernos = perno.tipo_pernos || 'SIN_TIPO';
          const nPernos = this.toNumber(perno.n_pernos_instalados);
          if (nPernos <= 0) continue;

          const key = `${seccion}|${equipoKey}|${tipoPernos}|${seccionLabor}`;
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
      const seccion = op.seccion || 'SIN_SECCION';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (registro.estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        // 🔥 CAMBIO NUEVO FORMATO
        const tipo = (opReg.tipo_labor || '').trim();
        const labor = (opReg.labor || '').trim();
        const ala = (opReg.ala || '').trim();

        const laborCompleta = `${tipo}${labor}${ala}`;
        const seccionLabor = this.obtenerSeccionLabor(opReg, mapaPlanes);
        for (const perno of this.getPernos(opReg)) {
          const tipoPernos = perno.tipo_pernos || 'SIN_TIPO';
          const nPernos = this.toNumber(perno.n_pernos_instalados);
          if (nPernos <= 0) continue;

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
      }
    });

    return Array.from(resultadoMap.values());
  }

  //GRAFICO 4
  ProcesarDMyUTI() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipoKey = `${op.equipo}-${op.n_equipo}`;
      const modeloEquipo = this.nombreEquipoGrafico(op);
      const seccion = op.seccion || 'SIN_SECCION';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const key = `${equipoKey}|${seccion}`;

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
        for (const perno of this.getPernos(opReg)) {
          const tipoPernos = perno.tipo_pernos || 'SIN_TIPO';
          const nPernos = this.toNumber(perno.n_pernos_instalados);
          if (nPernos <= 0) continue;

          if (mapa.has(tipoPernos)) {
            mapa.get(tipoPernos).total += nPernos;
          } else {
            mapa.set(tipoPernos, { tipoPernos, total: nPernos });
          }
        }
      });
    });

    return Array.from(mapa.values());
  }

  //Grafico 9
  ProcesarMHrEquipo() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipoKey = `${op.equipo}-${op.n_equipo}`;
      const modeloEquipo = this.nombreEquipoGrafico(op);
      const seccion = op.seccion || 'SIN_SECCION';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const key = `${seccion}|${equipoKey}`;

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
    const mapa = new Map<string, { modeloEquipo: string; metros: number }>();

    this.operacionesFiltradas.forEach((op) => {
      const equipoKey = `${op.equipo}-${op.n_equipo}`;
      const modeloEquipo = this.nombreEquipoGrafico(op);

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const metros = this.calcularMetrosPerforados(registros);

      if (mapa.has(equipoKey)) {
        mapa.get(equipoKey)!.metros += metros;
      } else {
        mapa.set(equipoKey, { modeloEquipo, metros });
      }
    });

    const resultado = Array.from(mapa.values()).map(({ modeloEquipo, metros }) => ({
      modeloEquipo,
      metros: Math.round(metros),
    }));

    return resultado;
  }

  //Grafico 11
  ProcesarHorometrosEquipo() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipoKey = `${op.equipo}-${op.n_equipo}`;
      const modeloEquipo = this.nombreEquipoGrafico(op);

      const horometros = op.horometros as any;

      if (!mapa.has(equipoKey)) {
        mapa.set(equipoKey, {
          modeloEquipo,
          diesel: 0,
          electrico: 0,
          percusion: 0,
        });
      }

      const grupo = mapa.get(equipoKey);

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
      const modeloEquipo = this.nombreEquipoGrafico(op);
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

      const equipoKey = op.equipo && op.n_equipo
        ? `${op.equipo}-${op.n_equipo}`
        : 'SIN_EQUIPO';
      const modelo = this.nombreEquipoGrafico(op);

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

      const key = equipoKey;

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
      const equipoKey = op.equipo && op.n_equipo
        ? `${op.equipo}-${op.n_equipo}`
        : 'SIN_EQUIPO';
      const modelo = this.nombreEquipoGrafico(op);

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const diferenciaPercusion = obtenerHorasHorometroSostenimiento(op, 'percusion');

      const metrosPerforadosTotal = this.calcularMetrosPerforados(registros);

      if (!mapa.has(equipoKey)) {
        mapa.set(equipoKey, {
          modelo_equipo: modelo,
          diferencia_percusion: 0,
          n_pernos: 0,
          log_pernos: 0,
          log_pernos_count: 0,
          n_labores_sostenidas: 0,
          metros_perforados: 0,
        });
      }

      const data = mapa.get(equipoKey);

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
      const modelo = this.nombreEquipoGrafico(op);

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const diferenciaPercusion = obtenerHorasHorometroSostenimiento(op, 'percusion');

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
        const pernos = this.getPernos(opData);
        const mallas = this.getMallas(opData);
        const totalFilas = Math.max(pernos.length, mallas.length);

        for (let index = 0; index < totalFilas; index++) {
          const perno = pernos[index];
          const malla = mallas[index];
          const nPernos = this.toNumber(perno?.n_pernos_instalados);
          const longitud = this.toNumber(perno?.log_pernos);
          const metros = nPernos > 0 && longitud > 0
            ? nPernos * longitud * 0.3048
            : 0;
          const sos_m_hr_hp =
            percusionPorRegistro > 0 ? metros / percusionPorRegistro : 0;

          resultado.push({
            modelo_equipo: modelo,
            labor_sos: laborSOS,
            seccion_labor: seccionLabor,
            n_pernos: nPernos,
            log_pernos: Number(longitud.toFixed(2)),
            mt52_malla: this.toNumber(malla?.mt52_malla),
            tipo_pernos: perno?.tipo_pernos || 'SIN_TIPO',
            metros_perforados: Number(metros.toFixed(2)),
            diferencia_percusion: Number(percusionPorRegistro.toFixed(2)),
            sos_m_hr_hp: Number(sos_m_hr_hp.toFixed(2)),
          });
        }
      });
    });

    console.log('🚀 DETALLE POR REGISTRO:', resultado);

    return resultado;
  }

  // Grafico 18
  procesarFrPorOperadorTurno() {
    return construirRankingOperadoresSostenimiento(this.operacionesFiltradas, this.estadosProceso);
  }

  //Grafico 19
  procesarLaborFRDetallado() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const equipoKey = op.equipo && op.n_equipo
        ? `${op.equipo}-${op.n_equipo}`
        : 'SIN_EQUIPO';
      const modelo = this.nombreEquipoGrafico(op);

      const operador = op.operador || 'SIN_OPERADOR';

      registrosArray.forEach((r) => {
        const operacion = r?.operacion || {};

        const tipo_labor = operacion?.tipo_labor || '';
        const labor = operacion?.labor || '';
        const ala = operacion?.ala || '';

        const observaciones = operacion?.observaciones;

        if (!observaciones || !observaciones.trim()) return;

        const labor_fr = `${tipo_labor}${labor}${ala}`.trim();

        const key = `${equipoKey}-${operador}-${labor_fr}`;

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
      'Operaciones',
      this.equipos  
    );
  }

  presentarMmto(): void {
    this.dialog.open(PresentacionMmtoEmpernadorComponent, {
      width: '1400px',
      maxWidth: 'calc(100vw - 16px)',
      maxHeight: '100dvh',
      panelClass: 'guardia-presentation-dialog',
      data: {
        operaciones: this.operacionesFiltradas,
        proceso: 'Empernador',
        turnoAplicado: this.turnoAplicado,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
      },
      autoFocus: 'dialog',
    });
  }

  JefeGuardia() {
    if (!this.operacionesFiltradas || this.operacionesFiltradas.length === 0) {
      console.warn('No hay datos filtrados para mostrar');
      return;
    }
  
    const dialogRef = this.dialog.open(PresentacionGefeGuardiaEmpernadorComponent, {
      width: '1800px',
      maxWidth: 'calc(100vw - 16px)',
      maxHeight: '100dvh',
      panelClass: 'guardia-presentation-dialog',
      data: {
        operaciones: this.operacionesFiltradas,
        turnoAplicado: this.turnoAplicado,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
      },
      disableClose: false,
      autoFocus: true,
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Diálogo cerrado', result);
    });
  }
}
