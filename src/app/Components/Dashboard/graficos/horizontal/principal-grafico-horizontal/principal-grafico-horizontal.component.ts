import { Component, OnInit } from '@angular/core';

import { PlanMensualService } from '../../../../../services/plan-mensual.service';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';

import { OperacionBase } from '../../../../../models/OperacionBase.models';
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
} from '../../../../../utils/fecha-utils';
import { DisponibilidadDiaComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-dia/disponibilidad-dia.component';
import { DisponibilidadSemanaComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-semana/disponibilidad-semana.component';
import { DisponibilidadMesComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-mes/disponibilidad-mes.component';
import { DisponibilidadEquipoComponent } from '../../scoops/Graficos components/Disponibilidad/disponibilidad-equipo/disponibilidad-equipo.component';
import { UtilizacionEquipoComponent } from '../../scoops/Graficos components/Utilizacion/utilizacion-equipo/utilizacion-equipo.component';
import { UtilizacionDiaMesComponent } from '../../scoops/Graficos components/Utilizacion/app-utilizacion-dia-mes/app-utilizacion-dia-mes.component';
import { UtilizacionSemanaComponent } from '../../scoops/Graficos components/Utilizacion/utilizacion-semana/utilizacion-semana.component';
import { UtilizacionMesComponent } from '../../scoops/Graficos components/Utilizacion/utilizacion-mes/utilizacion-mes.component';

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
  ],
  templateUrl: './principal-grafico-horizontal.component.html',
  styleUrl: './principal-grafico-horizontal.component.css',
})
export class PrincipalGraficoHorizontalComponent implements OnInit {
  anio!: number;
  mes!: string;

  // DATA ORIGINAL (sin filtrar)
  operacionesOriginal: OperacionBase[] = [];
  operacionesFiltradas: OperacionBase[] = [];
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
  resumen = {
    conteoEquipos: 0,
    metrosPorDisparo: 0,
    nFrentes: 0,
    totalMetros: 0,
  };

  datosGraficoEstados: any[] = [];

  ganttData: any[] = [];

  actividadesData = [
    // J-14
    { recurso: 'J-14', actividad: 'DES', inicio: 12, fin: 16, label: '' },
    {
      recurso: 'J-14',
      actividad: 'FRENTE COMPLETO',
      inicio: 7,
      fin: 12,
      label: '',
    },
    {
      recurso: 'J-14',
      actividad: 'FRENTE COMPLETO',
      inicio: 16,
      fin: 19,
      label: '',
    },

    // J-19
    {
      recurso: 'J-19',
      actividad: 'FRENTE COMPLETO',
      inicio: 7,
      fin: 10,
      label: '',
    },
    { recurso: 'J-19', actividad: 'BREASTING', inicio: 10, fin: 14, label: '' },
    {
      recurso: 'J-19',
      actividad: 'FRENTE COMPLETO',
      inicio: 14,
      fin: 19,
      label: '',
    },

    // J-20
    {
      recurso: 'J-20',
      actividad: 'DES',
      inicio: 7,
      fin: 9,
      label: 'bombeo de agua',
    },
    {
      recurso: 'J-20',
      actividad: 'FRENTE COMPLETO',
      inicio: 9,
      fin: 13,
      label: '',
    },
    { recurso: 'J-20', actividad: 'BREASTING', inicio: 13, fin: 17, label: '' },
    {
      recurso: 'J-20',
      actividad: 'FRENTE COMPLETO',
      inicio: 17,
      fin: 19,
      label: '',
    },
  ];
  dataPromedioEstados: any;
  cargandoPDF = false;
  vistaPrincipal: boolean = true;
  estadosProceso: any[] = [];

  private readonly CODIGOS_OPERATIVOS = ['101', '102', '105', '106', '108'];

  DataDisponibilidadPorEquipo: any[] = [];
  DataDisponibilidadPorDia: any[] = [];
  DataDisponibilidadPorSemana: any[] = [];
  DataDisponibilidadPorMes: any[] = [];
  DataUtilizacionPorEquipo: any[] = [];

  DataUtilizacionPorDia: any[] = [];
  DataUtilizacionPorSemana: any[] = [];
  DataUtilizacionPorMes: any[] = [];

  constructor(
    private planMensualService: PlanMensualService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService,
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

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO') {
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

    console.log(`📊 DISPONIBILIDAD POR ${tipo} - VISUAL:`, resultado);

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
    dataOperaciones: OperacionBase[],
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

        // SUMA(HORAS)
        item.horasTotales += horas;
        item.cantidadRegistros += 1;

        // SUMA(HRS MANTENIMIENTO)
        if (estado === 'MANTENIMIENTO') {
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
        if (estado === 'MANTENIMIENTO') {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        // SUMA(HRS OPERATIVAS)
        if (this.CODIGOS_OPERATIVOS.includes(codigo)) {
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

    console.log('📊 UTILIZACIÓN POR EQUIPO:', resultado);

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

    console.log(`📊 UTILIZACIÓN POR ${tipo} - VISUAL:`, resultado);

    return resultado;
  }
  private calcularUtilizacionBasePorDia(
    dataOperaciones: OperacionBase[],
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

        if (estado === 'MANTENIMIENTO') {
          item.horasMtto += horas;
          item.cantidadRegistrosMtto += 1;
        }

        if (this.CODIGOS_OPERATIVOS.includes(codigo)) {
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
  private filtrarSoloPorTurno(data: OperacionBase[]) {
    return data.filter((op) => {
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
      return true;
    });
  }
}
