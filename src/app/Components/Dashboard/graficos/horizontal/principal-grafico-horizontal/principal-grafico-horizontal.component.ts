import { Component, OnInit } from '@angular/core';

import { PlanMensualService } from '../../../../../services/plan-mensual.service';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';

import { OperacionBaseJumbo } from '../../../../../models/OperacionBase.models';
import { PlanMensual } from '../../../../../models/plan-mensual.model';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { EstadoService } from '../../../../../services/estado.service';
import { SchedulerComponent } from '../../Linea de tiempo/scheduler/scheduler.component';
import { CommonModule } from '@angular/common';
import {
  generarDiasEntreFechas,
  obtenerPeriodo,
  obtenerPeriodoDesdeKey,
  parseFechaSimple,
} from '../../../../../utils/fecha-utils';
import { DisponibilidadDiaComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-dia/disponibilidad-dia.component';
import { DisponibilidadSemanaComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-semana/disponibilidad-semana.component';
import { DisponibilidadMesComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-mes/disponibilidad-mes.component';
import { DisponibilidadEquipoComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-equipo/disponibilidad-equipo.component';

import { UtilizacionEquipoComponent } from '../../scoops/Graficos components/Utilizacion/utilizacion-equipo/utilizacion-equipo.component';
import { UtilizacionDiaMesComponent } from '../../scoops/Graficos components/Utilizacion/app-utilizacion-dia-mes/app-utilizacion-dia-mes.component';
import { UtilizacionSemanaComponent } from '../../scoops/Graficos components/Utilizacion/utilizacion-semana/utilizacion-semana.component';
import { UtilizacionMesComponent } from '../../scoops/Graficos components/Utilizacion/utilizacion-mes/utilizacion-mes.component';
import { RendimientoEquipoComponent } from '../Graficos components/Rendimiento/rendimiento-equipo/rendimiento-equipo.component';
import { RendimientoDiaComponent } from '../Graficos components/Rendimiento/rendimiento-dia/rendimiento-dia.component';
import { RendimientoSemanaComponent } from '../Graficos components/Rendimiento/rendimiento-semana/rendimiento-semana.component';
import { RendimientoMesComponent } from '../Graficos components/Rendimiento/rendimiento-mes/rendimiento-mes.component';
import { ParetoUtilizacionComponent } from '../Graficos components/Pareto/pareto-utilizacion/pareto-utilizacion.component';
import { ParetoDisponibilidadComponent } from '../Graficos components/Pareto/pareto-disponibilidad/pareto-disponibilidad.component';
import { DisponibilidadGuardiaComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-guardia/disponibilidad-guardia.component';
import { UtilizacionGuardiaComponent } from '../../scoops/Graficos components/Utilizacion/utilizacion-guardia/utilizacion-guardia.component';
import { RendimientoGuardiaComponent } from '../../scoops/Graficos components/Rendimiento/rendimiento-guardia/rendimiento-guardia.component';
import { RankingOperadorRendimientoComponent } from '../Graficos components/Rendimiento/ranking-operador-rendimiento/ranking-operador-rendimiento.component';
import { RankingOperadorUtilizacionComponent } from '../Graficos components/Utilizacion/ranking-operador-utilizacion/ranking-operador-utilizacion.component';
import { MtbfEquipoComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTBF/mtbf-equipo/mtbf-equipo.component';
import { MttrEquipoComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTTR/mttr-equipo/mttr-equipo.component';
import { MtbfSemanasComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTBF/mtbf-semanas/mtbf-semanas.component';
import { MtbfMesComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTBF/mtbf-mes/mtbf-mes.component';
import { MtbfAnoComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTBF/mtbf-ano/mtbf-ano.component';
import { MttrSemanasComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTTR/mttr-semanas/mttr-semanas.component';
import { MttrMesComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTTR/mttr-mes/mttr-mes.component';
import { MttrAnoComponent } from '../../scoops/Graficos components/MTBF-MTTR/MTTR/mttr-ano/mttr-ano.component';

import { PresentacionHorizontalDialogComponent } from '../presentacion-dialog/presentacion-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-principal-grafico-horizontal',
  imports: [
    FormsModule,
    SchedulerComponent,
    CommonModule,
    DisponibilidadDiaComponent,
    DisponibilidadSemanaComponent,
    DisponibilidadMesComponent,
    DisponibilidadEquipoComponent,
    UtilizacionEquipoComponent,
    UtilizacionDiaMesComponent,
    UtilizacionSemanaComponent,
    UtilizacionMesComponent,
    RendimientoEquipoComponent,
    RendimientoDiaComponent,
    RendimientoSemanaComponent,
    RendimientoMesComponent,
    ParetoUtilizacionComponent,
    ParetoDisponibilidadComponent,
    DisponibilidadGuardiaComponent,
    UtilizacionGuardiaComponent,
    RendimientoGuardiaComponent,
    RankingOperadorRendimientoComponent,
    RankingOperadorUtilizacionComponent,
    MtbfEquipoComponent,
    MttrEquipoComponent,
    MtbfSemanasComponent,
    MtbfMesComponent,
    MtbfAnoComponent,
    MttrSemanasComponent,
    MttrMesComponent,
    MttrAnoComponent,
  ],
  templateUrl: './principal-grafico-horizontal.component.html',
  styleUrl: './principal-grafico-horizontal.component.css',
})
export class PrincipalGraficoHorizontalComponent implements OnInit {
  anio!: number;
  mes!: string;

  // DATA ORIGINAL (sin filtrar)
  operacionesOriginal: OperacionBaseJumbo[] = [];
  operacionesFiltradas: OperacionBaseJumbo[] = [];
  planesMensuales: PlanMensual[] = [];

  // 🔥 DATA FINAL PARA LOS GRAFICOS
  dataAvanceFase: any[] = [];
  dataDisparosEquipo: any[] = []; // 👈 NUEVO
  dataDisparosDia: any[] = [];
  dataIndicadoresEquipo: any[] = [];
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
  showZoom = false;
  resumen = {
    conteoEquipos: 0,
    metrosPorDisparo: 0,
    nFrentes: 0,
    totalMetros: 0,
  };

  datosGraficoEstados: any[] = [];

  ganttData: any[] = [];

  dataPromedioEstados: any;
  cargandoPDF = false;
  vistaPrincipal: boolean = true;
  estadosProceso: any[] = [];

  DataDisponibilidadPorEquipo: any[] = [];
  DataDisponibilidadPorDia: any[] = [];
  DataDisponibilidadPorSemana: any[] = [];
  DataDisponibilidadPorMes: any[] = [];
  DataUtilizacionPorEquipo: any[] = [];

  DataUtilizacionPorDia: any[] = [];
  DataUtilizacionPorSemana: any[] = [];
  DataUtilizacionPorMes: any[] = [];

  DataRendimientoPorEquipo: any[] = [];
  DataRendimientoPorDia: any[] = [];
  DataRendimientoPorSemana: any[] = [];
  DataRendimientoPorMes: any[] = [];
  DataParetoUtilizacionJumbos: any[] = [];
  DataParetoDisponibilidadJumbos: any[] = [];
  DataDisponibilidadPorGuardia: any[] = [];
  DataUtilizacionPorGuardia: any[] = [];
  DataRendimientoPorGuardia: any[] = [];

  DataRankingOperadorUtilizacion: any[] = [];
  DataRankingOperadorRendimiento: any[] = [];

  DataMTTRPorEquipo: any[] = [];
  DataMTBFPorEquipo: any[] = [];

  DataMTTRPorDia: any[] = [];
  DataMTTRPorSemana: any[] = [];
  DataMTTRPorMes: any[] = [];
  DataMTTRPorAnio: any[] = [];
  DataMTBFPorDia: any[] = [];
  DataMTBFPorSemana: any[] = [];
  DataMTBFPorMes: any[] = [];
  DataMTBFPorAnio: any[] = [];

  constructor(
    private planMensualService: PlanMensualService,
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
    this.obtenerEstadosPorProceso('PERFORACIÓN HORIZONTAL');
  }

  toggleVista() {
    this.vistaPrincipal = !this.vistaPrincipal;
  }
  toggleDataZoom(): void {
    this.showZoom = !this.showZoom;
  }

  obtenerEstadosPorProceso(proceso: string) {
    this.estadoService.getEstadosByProceso(proceso).subscribe({
      next: (data) => {
        this.estadosProceso = data;
        console.log('Estados por proceso:', data);

        // 🔥 CLAVE
        this.construirMapaEstados();
      },
      error: (err) => {
        console.error('Error al traer estados por proceso', err);
      },
    });
  }

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
    const tipo = 'tal_horizontal';

    this.operacionesService.getAllAprobados(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginal = resp.data;

        //console.log('🔥 DATA OPERACIONES:', this.operacionesOriginal);

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
        //console.log('🔥 PLANES MENSUALES:', this.planesMensuales);

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

    this.DataDisponibilidadPorEquipo = this.DisponibilidadPorEquipo();
    this.DataDisponibilidadPorDia = this.DisponibilidadPorDia();
    this.DataDisponibilidadPorSemana = this.DisponibilidadPorSemana();
    this.DataDisponibilidadPorMes = this.DisponibilidadPorMes();
    this.DataUtilizacionPorEquipo = this.UtilizacionPorEquipo();

    this.DataUtilizacionPorDia = this.UtilizacionPorDia();
    this.DataUtilizacionPorSemana = this.UtilizacionPorSemana();
    this.DataUtilizacionPorMes = this.UtilizacionPorMes();

    this.DataRendimientoPorEquipo = this.RendimientoPorEquipo();

    this.DataRendimientoPorDia = this.RendimientoPorDia();
    this.DataRendimientoPorSemana = this.RendimientoPorSemana();
    this.DataRendimientoPorMes = this.RendimientoPorMes();
    this.DataParetoUtilizacionJumbos = this.ParetoUtilizacionJumbos();
    this.DataParetoDisponibilidadJumbos = this.ParetoDisponibilidadJumbos();
    this.DataDisponibilidadPorGuardia = this.DisponibilidadPorGuardia();
    this.DataUtilizacionPorGuardia = this.UtilizacionPorGuardia();
    this.DataRendimientoPorGuardia = this.RendimientoPorGuardia();
    this.DataRankingOperadorUtilizacion = this.OperadorUtilizacion();
    this.DataRankingOperadorRendimiento = this.OperadorRendimiento();
    this.DataMTTRPorEquipo = this.MTTRPorEquipo();
    this.DataMTBFPorEquipo = this.MTBFPorEquipo();

    this.DataMTTRPorSemana = this.MTTRPorSemana();
    this.DataMTTRPorMes = this.MTTRPorMes();
    this.DataMTTRPorAnio = this.MTTRPorAño();
    this.DataMTBFPorSemana = this.MTBFPorSemana();
    this.DataMTBFPorMes = this.MTBFPorMes();
    this.DataMTBFPorAnio = this.MTBFPorAño();

    //console.log('🔥 DATA DISPAROS EQUIPO:', this.dataDisparosEquipo);
  }

  estadosBloqueados = ['FUERA DE PLAN'];

  mapaEstados: Map<string, any> = new Map();

  construirMapaEstados() {
    this.mapaEstados.clear();

    this.estadosProceso.forEach((e) => {
      const codigo = String(e.codigo || '').trim();
      this.mapaEstados.set(codigo, e);
    });

    //console.log('🧩 Mapa de estados construido:', this.mapaEstados.size);
  }

  DisponibilidadPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'SIN EQUIPO';
      const nEquipo = op.n_equipo || 'SIN N° EQUIPO';

      const key = nEquipo;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo,
          modeloEquipo: nEquipo,
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
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        const codigo = String(registro.codigo || '').trim();

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
        const disponibilidad =
          (item.horasDisponibles / item.horasTotales) * 100;

        item.disponibilidad = Number(disponibilidad.toFixed(2));
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
    return this.calcularDisponibilidadBasePorDia(
      this.operacionesFiltradas,
      true,
    );
  }

  DisponibilidadPorSemana() {
    return this.calcularDisponibilidadPorPeriodoVisual('SEMANA');
  }

  DisponibilidadPorMes() {
    return this.calcularDisponibilidadPorPeriodoVisual('MES');
  }

  private calcularDisponibilidadPorPeriodoVisual(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = this.crearPeriodosVisiblesDisponibilidad(tipo);

    // Usa operacionesOriginal para que fechaInicio y fechaFin NO afecten el cálculo
    // Solo se filtra por turno, si corresponde
    const dataCalculo = this.filtrarSoloPorTurno(this.operacionesOriginal);

    const datosPorDia = this.calcularDisponibilidadBasePorDia(
      dataCalculo,
      false,
    );

    datosPorDia.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

      if (!periodo) return;

      // Solo muestra semanas/meses dentro del rango visual seleccionado
      if (!resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);

      item.horasTotales += Number(dia.horasTotales || 0);
      item.horasMtto += Number(dia.horasMtto || 0);
      item.horasDisponibles += Number(dia.horasDisponibles || 0);

      item.cantidadOperaciones += Number(dia.cantidadOperaciones || 0);
      item.cantidadRegistros += Number(dia.cantidadRegistros || 0);
      item.cantidadRegistrosMtto += Number(dia.cantidadRegistrosMtto || 0);
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
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
  private crearPeriodosVisiblesDisponibilidad(tipo: 'SEMANA' | 'MES') {
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
  private calcularDisponibilidadBasePorDia(
    dataOperaciones: OperacionBaseJumbo[],
    crearRangoVisual: boolean,
  ) {
    const resultadoMap = new Map<string, any>();

    // Solo para DisponibilidadPorDia:
    // crea todos los días del rango seleccionado, incluso si no tienen data
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
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        const codigo = String(registro.codigo || '').trim();

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

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }

  calcularDuracionHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFinal.split(':').map(Number);

    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    return (fin - inicio) / 60; // en horas
  }

  Presentacion() {
    if (!this.operacionesFiltradas || this.operacionesFiltradas.length === 0) {
      console.warn('No hay datos filtrados para mostrar');
      return;
    }

    const dialogRef = this.dialog.open(PresentacionHorizontalDialogComponent, {
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

  UtilizacionPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'SIN EQUIPO';
      const nEquipo = op.n_equipo || 'SIN N° EQUIPO';

      const key = nEquipo;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo,
          modeloEquipo: nEquipo,
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
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        const codigo = String(registro.codigo || '').trim();

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        // SUMA(HRS OPERATIVAS)
        if (this.esCodigoOperativo(codigo)) {
          item.horasOperativas += horas;
          item.cantidadRegistrosOperativos += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasDisponibles = item.horasTotales - item.horasMtto;

      if (item.horasDisponibles > 0) {
        const utilizacion =
          (item.horasOperativas / item.horasDisponibles) * 100;

        item.utilizacion = Number(utilizacion.toFixed(2));
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
    return this.calcularUtilizacionBasePorDia(this.operacionesFiltradas, true);
  }

  UtilizacionPorSemana() {
    return this.calcularUtilizacionPorPeriodoVisual('SEMANA');
  }

  UtilizacionPorMes() {
    return this.calcularUtilizacionPorPeriodoVisual('MES');
  }

  private calcularUtilizacionPorPeriodoVisual(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = this.crearPeriodosVisiblesUtilizacion(tipo);

    // Usa data original para que fechaInicio y fechaFin NO afecten el cálculo
    // Solo filtro por turno, si corresponde
    const dataCalculo = this.filtrarSoloPorTurno(this.operacionesOriginal);

    const datosPorDia = this.calcularUtilizacionBasePorDia(dataCalculo, false);

    datosPorDia.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

      if (!periodo) return;

      // Solo se muestran semanas/meses que están dentro del rango visual seleccionado
      if (!resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);

      item.horasTotales += Number(dia.horasTotales || 0);
      item.horasMtto += Number(dia.horasMtto || 0);
      item.horasDisponibles += Number(dia.horasDisponibles || 0);
      item.horasOperativas += Number(dia.horasOperativas || 0);

      item.cantidadOperaciones += Number(dia.cantidadOperaciones || 0);
      item.cantidadRegistros += Number(dia.cantidadRegistros || 0);
      item.cantidadRegistrosOperativos += Number(
        dia.cantidadRegistrosOperativos || 0,
      );
      item.cantidadRegistrosMtto += Number(dia.cantidadRegistrosMtto || 0);

      if (dia.horasDisponibles > 0) {
        item.sumaUtilizacion += Number(dia.utilizacion || 0);
        item.cantidadDiasConDatos += 1;
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      if (item.cantidadDiasConDatos > 0) {
        item.utilizacion = Number(
          (item.sumaUtilizacion / item.cantidadDiasConDatos).toFixed(2),
        );
      } else {
        item.utilizacion = 0;
      }

      item.sumaUtilizacion = Number(item.sumaUtilizacion.toFixed(2));
      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => a.key.localeCompare(b.key));

    return resultado;
  }
  private calcularUtilizacionBasePorDia(
    dataOperaciones: OperacionBaseJumbo[],
    usarRangoFechas: boolean,
  ) {
    const resultadoMap = new Map<string, any>();

    // Solo para el gráfico por día: crear todos los días del rango seleccionado
    if (usarRangoFechas && this.fechaInicio && this.fechaFin) {
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
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        const codigo = String(registro.codigo || '').trim();

        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        if (estado === 'MANTENIMIENTO' || this.esCodigoMantenimiento(codigo)) {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        if (this.esCodigoOperativo(codigo)) {
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

    resultado.sort((a, b) => a.key.localeCompare(b.key));

    return resultado;
  }
  private crearPeriodosVisiblesUtilizacion(tipo: 'SEMANA' | 'MES') {
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

          sumaUtilizacion: 0,
          utilizacion: 0,

          // días que entran en el rango visual seleccionado
          cantidadDiasRango: 0,

          // días reales con datos usados para el promedio
          cantidadDiasConDatos: 0,

          horasTotales: 0,
          horasMtto: 0,
          horasDisponibles: 0,
          horasOperativas: 0,

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
  private filtrarSoloPorTurno(data: OperacionBaseJumbo[]) {
    return data.filter((op) => {
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
      return true;
    });
  }

  RendimientoPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'SIN EQUIPO';
      const nEquipo = op.n_equipo || op.modelo_equipo || 'SIN N° EQUIPO';

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

          talProd: 0,
          talRimados: 0,
          talAlivio: 0,
          //talRepaso: 0,

          totalTaladros: 0,
          totalBarras: 0,
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

        const operacion = registro.operacion || {};

        const talProd = this.convertirNumero(operacion.tal_prod);
        const talRimados = this.convertirNumero(operacion.tal_rimados);
        const talAlivio = this.convertirNumero(operacion.tal_alivio);
        //const talRepaso = this.convertirNumero(operacion.tal_repaso);

        const longBarrasPies = this.convertirNumero(operacion.long_barras);

        // Si viene vacío, asumimos 1 barra
        const numBarras = this.convertirNumero(operacion.num_barras, 1);

        const totalTaladros = talProd + talRimados + talAlivio; //+ talRepaso;

        const longBarrasMetros = longBarrasPies * 0.3048;

        const metrosRegistro = totalTaladros * longBarrasMetros * numBarras;

        item.metrosPerforados += metrosRegistro;
        item.horasOperativas += horas;

        item.talProd += talProd;
        item.talRimados += talRimados;
        item.talAlivio += talAlivio;
        //item.talRepaso += talRepaso;

        item.totalTaladros += totalTaladros;
        item.totalBarras += numBarras;

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

  RendimientoPorDia() {
    return this.calcularRendimientoBasePorDia(this.operacionesFiltradas, true);
  }

  RendimientoPorSemana() {
    return this.calcularRendimientoPorPeriodoVisual('SEMANA');
  }

  RendimientoPorMes() {
    return this.calcularRendimientoPorPeriodoVisual('MES');
  }

  private calcularRendimientoPorPeriodoVisual(tipo: 'SEMANA' | 'MES') {
    const resultadoMap = this.crearPeriodosVisiblesRendimiento(tipo);

    // Usa operacionesOriginal para que fechaInicio y fechaFin solo afecten la visualización
    const dataCalculo = this.filtrarSoloPorTurno(this.operacionesOriginal);

    const datosPorDia = this.calcularRendimientoBasePorDia(dataCalculo, false);

    datosPorDia.forEach((dia) => {
      const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

      if (!periodo) return;

      // Solo muestra semanas/meses dentro del rango visual seleccionado
      if (!resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);

      item.metrosPerforados += Number(dia.metrosPerforados || 0);
      item.horasOperativas += Number(dia.horasOperativas || 0);

      item.cantidadOperaciones += Number(dia.cantidadOperaciones || 0);
      item.cantidadRegistros += Number(dia.cantidadRegistros || 0);
      item.cantidadRegistrosOperativos += Number(
        dia.cantidadRegistrosOperativos || 0,
      );

      item.talProd += Number(dia.talProd || 0);
      item.talRimados += Number(dia.talRimados || 0);
      item.talAlivio += Number(dia.talAlivio || 0);
      item.talRepaso += Number(dia.talRepaso || 0);
      item.totalTaladros += Number(dia.totalTaladros || 0);

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

      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }
  private crearPeriodosVisiblesRendimiento(tipo: 'SEMANA' | 'MES') {
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

          talProd: 0,
          talRimados: 0,
          talAlivio: 0,
          talRepaso: 0,
          totalTaladros: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);
      item.cantidadDiasRango += 1;
    });

    return resultadoMap;
  }
  private calcularRendimientoBasePorDia(
    dataOperaciones: OperacionBaseJumbo[],
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

          talProd: 0,
          talRimados: 0,
          talAlivio: 0,
          talRepaso: 0,
          totalTaladros: 0,
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

          talProd: 0,
          talRimados: 0,
          talAlivio: 0,
          talRepaso: 0,
          totalTaladros: 0,
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

        const operacion = registro.operacion || {};

        const talProd = this.convertirNumero(operacion.tal_prod);
        const talRimados = this.convertirNumero(operacion.tal_rimados);
        const talAlivio = this.convertirNumero(operacion.tal_alivio);
        const talRepaso = this.convertirNumero(operacion.tal_repaso);

        const longBarrasPies = this.convertirNumero(operacion.long_barras);

        // Si num_barras viene vacío, se asume 1
        const numBarras = this.convertirNumero(operacion.num_barras, 1);

        const totalTaladros = talProd + talRimados + talAlivio + talRepaso;

        const longBarrasMetros = longBarrasPies * 0.3048;

        const metrosRegistro = totalTaladros * longBarrasMetros * numBarras;

        item.metrosPerforados += metrosRegistro;
        item.horasOperativas += horas;

        item.talProd += talProd;
        item.talRimados += talRimados;
        item.talAlivio += talAlivio;
        item.talRepaso += talRepaso;
        item.totalTaladros += totalTaladros;

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

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }
  private convertirNumero(valor: any, valorDefault: number = 0): number {
    if (valor === null || valor === undefined || valor === '') {
      return valorDefault;
    }

    const numero = Number(valor);

    return isNaN(numero) ? valorDefault : numero;
  }

  ParetoUtilizacionJumbos() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!codigo) continue;

        // Solo DEMORAS OPERATIVAS y DEMORAS NO OPERATIVAS
        if (!this.esDemoraJumboPorCodigo(codigo)) continue;

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

    // Orden Pareto: mayor HorasDemora primero.
    // Si empatan, orden alfabético por actividad.
    resultado.sort((a, b) => {
      if (b.horasDemora !== a.horasDemora) {
        return b.horasDemora - a.horasDemora;
      }

      return String(a.actividad).localeCompare(String(b.actividad));
    });

    const totalHorasDemora = resultado.reduce(
      (sum, item) => sum + item.horasDemora,
      0,
    );

    let acumulado = 0;

    resultado = resultado.map((item) => {
      acumulado += item.horasDemora;

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

  private obtenerActividadPorCodigo(codigo: string): string {
    const estado = this.mapaEstados.get(codigo);

    if (!estado) return `COD ${codigo}`;

    return (
      estado.tipo_estado ||
      estado.categoria ||
      estado.estado_principal ||
      `COD ${codigo}`
    );
  }
  private esDemoraJumboPorCodigo(codigo: string): boolean {
    const estado = this.mapaEstados.get(codigo);

    if (!estado) return false;

    const categoria = this.normalizarTexto(estado.categoria);
    const estadoPrincipal = this.normalizarTexto(estado.estado_principal);

    return categoria.includes('DEMORA') || estadoPrincipal.includes('DEMORA');
  }

  private obtenerEstadoPorCodigo(codigo: string) {
    return this.mapaEstados.get(String(codigo || '').trim());
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

  private normalizarTexto(valor: any): string {
    return String(valor || '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private esMantenimientoJumboPorCodigo(codigo: string): boolean {
    const estado = this.mapaEstados.get(codigo);

    if (!estado) return false;

    const estadoPrincipal = this.normalizarTexto(estado.estado_principal);
    const categoria = this.normalizarTexto(estado.categoria);

    return (
      estadoPrincipal.includes('MANTENIMIENTO') ||
      categoria.includes('MANTENIMIENTO')
    );
  }

  ParetoDisponibilidadJumbos() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!codigo) continue;

        /**
         * Solo considerar registros que afectan DISPONIBILIDAD.
         * Normalmente son registros de MANTENIMIENTO.
         */
        const estadoRegistro = this.normalizarTexto(registro.estado);

        const esMantenimiento =
          estadoRegistro.includes('MANTENIMIENTO') ||
          this.esMantenimientoJumboPorCodigo(codigo);

        if (!esMantenimiento) continue;

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const observacion = String(
          registro.operacion?.observaciones || 'SIN OBSERVACIÓN',
        )
          .trim()
          .toUpperCase();

        const key = observacion || 'SIN OBSERVACIÓN';

        if (!resultadoMap.has(key)) {
          resultadoMap.set(key, {
            observacion: key,
            horasGeneral: 0,
            paretoDispObs: 0,
            porcentajeHoras: 0,
            totalHorasGeneral: 0,
            cantidadRegistros: 0,
            codigos: new Set<string>(),
          });
        }

        const item = resultadoMap.get(key);

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

    /**
     * Mismo criterio que tu DAX:
     * [Horas General] > curHoras
     * o empate por observación alfabética.
     */
    resultado.sort((a, b) => {
      if (b.horasGeneral !== a.horasGeneral) {
        return b.horasGeneral - a.horasGeneral;
      }

      return String(a.observacion).localeCompare(String(b.observacion));
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

          talProd: 0,
          talRimados: 0,
          talAlivio: 0,
          talRepaso: 0,
          totalTaladros: 0,
          totalBarras: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        // Solo códigos operativos según API de estados
        if (!this.esCodigoOperativo(codigo)) continue;

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const operacion = registro.operacion || {};

        const talProd = this.convertirNumero(operacion.tal_prod);
        const talRimados = this.convertirNumero(operacion.tal_rimados);
        const talAlivio = this.convertirNumero(operacion.tal_alivio);
        const talRepaso = this.convertirNumero(operacion.tal_repaso);

        const longBarrasPies = this.convertirNumero(operacion.long_barras);

        // Si viene vacío, se asume 1 barra
        const numBarras = this.convertirNumero(operacion.num_barras, 1);

        const totalTaladros = talProd + talRimados + talAlivio + talRepaso;

        // Convertir pies a metros
        const longBarrasMetros = longBarrasPies * 0.3048;

        const metrosRegistro = totalTaladros * longBarrasMetros * numBarras;

        item.metrosPerforados += metrosRegistro;
        item.horasOperativas += horas;

        item.talProd += talProd;
        item.talRimados += talRimados;
        item.talAlivio += talAlivio;
        item.talRepaso += talRepaso;
        item.totalTaladros += totalTaladros;
        item.totalBarras += numBarras;

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

  OperadorUtilizacion() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const operador = op.operador || 'SIN OPERADOR';

      const key = operador;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          operador,

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
  OperadorRendimiento() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const operador = op.operador || 'SIN OPERADOR';

      const key = operador;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          operador,

          metrosPerforados: 0,
          horasOperativas: 0,
          rendimiento: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosOperativos: 0,

          talProd: 0,
          talRimados: 0,
          talAlivio: 0,
          talRepaso: 0,
          totalTaladros: 0,
          totalBarras: 0,

          modelosEquipo: new Set<string>(),
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;
      if (op.modelo_equipo) {
        item.modelosEquipo.add(op.modelo_equipo);
      }

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        // Solo códigos operativos según API
        if (!this.esCodigoOperativo(codigo)) continue;

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        const operacion = registro.operacion || {};

        const talProd = this.convertirNumero(operacion.tal_prod);
        const talRimados = this.convertirNumero(operacion.tal_rimados);
        const talAlivio = this.convertirNumero(operacion.tal_alivio);
        //const talRepaso = this.convertirNumero(operacion.tal_repaso);

        const longBarrasPies = this.convertirNumero(operacion.long_barras);

        const numBarras = this.convertirNumero(operacion.num_barras, 1);

        const totalTaladros = talProd + talRimados + talAlivio; // + talRepaso;

        const longBarrasMetros = longBarrasPies * 0.3048;

        const metrosRegistro = totalTaladros * longBarrasMetros * numBarras;

        item.metrosPerforados += metrosRegistro;
        item.horasOperativas += horas;

        item.talProd += talProd;
        item.talRimados += talRimados;
        item.talAlivio += talAlivio;
        //const talRepaso = this.convertirNumero(operacion.tal_repaso);
        item.totalTaladros += totalTaladros;
        item.totalBarras += numBarras;

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

      item.modelosEquipo = Array.from(item.modelosEquipo);

      item.equiposLabel = item.modelosEquipo.length
        ? item.modelosEquipo.join(', ')
        : 'SIN MODELO';

      return item;
    });

    resultado.sort((a, b) => b.rendimiento - a.rendimiento);

    return resultado;
  }

  MTTRPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'SIN EQUIPO';
      const nEquipo = op.n_equipo || 'SIN N° EQUIPO';
      const modeloEquipo = op.modelo_equipo || nEquipo;

      const key = modeloEquipo;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo,
          n_equipo: nEquipo,
          modelo_equipo: modeloEquipo,

          horasMttoCorrectivo: 0,
          fallas: 0,
          mttr: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMttoCorrectivo: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        item.cantidadRegistros += 1;

        if (this.esMantenimientoCorrectivo(codigo)) {
          item.horasMttoCorrectivo += horas;

          // Cada registro de mantenimiento correctivo cuenta como una falla
          item.fallas += 1;

          item.cantidadRegistrosMttoCorrectivo += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      if (item.fallas > 0) {
        item.mttr = Number((item.horasMttoCorrectivo / item.fallas).toFixed(2));
      } else {
        item.mttr = 0;
      }

      item.horasMttoCorrectivo = Number(item.horasMttoCorrectivo.toFixed(2));

      return item;
    });

    resultado.sort((a, b) => b.mttr - a.mttr);

    return resultado;
  }
  MTBFPorEquipo() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const equipo = op.equipo || 'SIN EQUIPO';
      const nEquipo = op.n_equipo || 'SIN N° EQUIPO';
      const modeloEquipo = op.modelo_equipo || nEquipo;

      const key = modeloEquipo;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      if (!resultadoMap.has(key)) {
        resultadoMap.set(key, {
          equipo,
          n_equipo: nEquipo,
          modelo_equipo: modeloEquipo,

          horasTotales: 0,
          horasMttoCorrectivo: 0,
          horasSinMttoCorrectivo: 0,

          fallas: 0,
          mtbf: 0,

          cantidadOperaciones: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMttoCorrectivo: 0,
        });
      }

      const item = resultadoMap.get(key);

      item.cantidadOperaciones += 1;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        // SUMA(BD_JUMBOS[HORAS])
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(BD_JUMBOS[Hrs. Mtto. Correctivo])
        if (this.esMantenimientoCorrectivo(codigo)) {
          item.horasMttoCorrectivo += horas;

          // SUMA(BD_JUMBOS[#FALLAS])
          item.fallas += 1;

          item.cantidadRegistrosMttoCorrectivo += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasSinMttoCorrectivo =
        item.horasTotales - item.horasMttoCorrectivo;

      const divisorFallas = item.fallas === 0 ? 1 : item.fallas;

      item.mtbf = Number(
        (item.horasSinMttoCorrectivo / divisorFallas).toFixed(2),
      );

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMttoCorrectivo = Number(item.horasMttoCorrectivo.toFixed(2));
      item.horasSinMttoCorrectivo = Number(
        item.horasSinMttoCorrectivo.toFixed(2),
      );

      return item;
    });

    resultado.sort((a, b) => b.mtbf - a.mtbf);

    return resultado;
  }

  MTTRPorSemana() {
    return this.calcularMTTRMTBFPorPeriodoVisual('SEMANA');
  }

  MTTRPorMes() {
    return this.calcularMTTRMTBFPorPeriodoVisual('MES');
  }

  MTTRPorAño() {
    return this.calcularMTTRMTBFPorPeriodoVisual('ANIO');
  }

  MTBFPorSemana() {
    return this.calcularMTTRMTBFPorPeriodoVisual('SEMANA');
  }

  MTBFPorMes() {
    return this.calcularMTTRMTBFPorPeriodoVisual('MES');
  }

  MTBFPorAño() {
    return this.calcularMTTRMTBFPorPeriodoVisual('ANIO');
  }

  private calcularMTTRMTBFPorPeriodoVisual(tipo: 'SEMANA' | 'MES' | 'ANIO') {
    const resultadoMap = this.crearPeriodosVisiblesMTTRMTBF(tipo);

    const dataCalculo = this.operacionesOriginal;

    dataCalculo.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      const fecha = op.fecha;

      if (!fecha) return;

      const periodo = this.obtenerPeriodoMTBFMTTR(fecha, tipo);

      if (!periodo) return;

      /**
       * Clave:
       * Si el mes/año no está dentro del rango visual seleccionado,
       * no se muestra.
       * Pero si está, el cálculo usa TODA la data original de ese mes/año.
       */
      if (!resultadoMap.has(periodo.key)) return;

      const item = resultadoMap.get(periodo.key);

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!registro.hora_inicio || !registro.hora_final) continue;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        if (this.esMantenimientoCorrectivo(codigo)) {
          item.horasMttoCorrectivo += horas;
          item.fallas += 1;
          item.cantidadRegistrosMttoCorrectivo += 1;
        }
      }
    });

    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.horasSinMttoCorrectivo =
        item.horasTotales - item.horasMttoCorrectivo;

      if (item.fallas > 0) {
        item.mttr = Number((item.horasMttoCorrectivo / item.fallas).toFixed(2));
      } else {
        item.mttr = 0;
      }

      const divisorFallas = item.fallas === 0 ? 1 : item.fallas;

      item.mtbf = Number(
        (item.horasSinMttoCorrectivo / divisorFallas).toFixed(2),
      );

      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMttoCorrectivo = Number(item.horasMttoCorrectivo.toFixed(2));
      item.horasSinMttoCorrectivo = Number(
        item.horasSinMttoCorrectivo.toFixed(2),
      );

      return item;
    });

    resultado.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return resultado;
  }

  private crearPeriodosVisiblesMTTRMTBF(tipo: 'SEMANA' | 'MES' | 'ANIO') {
    const resultadoMap = new Map<string, any>();

    if (!this.fechaInicio || !this.fechaFin) {
      return resultadoMap;
    }

    const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

    diasRango.forEach((dia) => {
      const periodo = this.obtenerPeriodoMTBFMTTR(dia.key, tipo);

      if (!periodo) return;

      if (!resultadoMap.has(periodo.key)) {
        resultadoMap.set(periodo.key, {
          key: periodo.key,
          periodo: periodo.label,
          anio: periodo.anio || null,
          fechaInicio: periodo.fechaInicio || null,
          fechaFin: periodo.fechaFin || null,

          horasTotales: 0,
          horasMttoCorrectivo: 0,
          horasSinMttoCorrectivo: 0,

          fallas: 0,
          mttr: 0,
          mtbf: 0,

          cantidadDiasRango: 0,
          cantidadRegistros: 0,
          cantidadRegistrosMttoCorrectivo: 0,
        });
      }

      const item = resultadoMap.get(periodo.key);
      item.cantidadDiasRango += 1;
    });

    return resultadoMap;
  }
  private obtenerPeriodoMTBFMTTR(
    fecha: string,
    tipo: 'DIA' | 'SEMANA' | 'MES' | 'ANIO',
  ) {
    if (tipo === 'DIA') {
      return obtenerPeriodo(fecha, 'DIA');
    }

    if (tipo === 'SEMANA') {
      return obtenerPeriodoDesdeKey(fecha, 'SEMANA');
    }

    if (tipo === 'MES') {
      return obtenerPeriodoDesdeKey(fecha, 'MES');
    }

    if (tipo === 'ANIO') {
      const date = parseFechaSimple(fecha);

      if (!date) return null;

      const anio = date.getFullYear();

      return {
        key: `${anio}`,
        label: `${anio}`,
        anio,
      };
    }

    return null;
  }

  private esMantenimientoCorrectivo(codigo: string): boolean {
    return String(codigo || '').trim() === '202';
  }
}
