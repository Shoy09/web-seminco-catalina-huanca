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

  DataDisponibilidadPorEquipo: any[] = [];
  DataDisponibilidadPorDia: any[] = [];
  DataDisponibilidadPorSemana: any[] = [];
  DataDisponibilidadPorMes: any[] = [];

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

    console.log('📊 DISPONIBILIDAD POR EQUIPO:', resultado);

    return resultado;
  }

  DisponibilidadPorDia() {
    return this.calcularDisponibilidadPorPeriodo('DIA');
  }

  DisponibilidadPorSemana() {
    return this.calcularDisponibilidadPorPeriodo('SEMANA');
  }

  DisponibilidadPorMes() {
    return this.calcularDisponibilidadPorPeriodo('MES');
  }

  private calcularDisponibilidadPorPeriodo(tipo: 'DIA' | 'SEMANA' | 'MES') {
    const resultadoMap = new Map<string, any>();

    // Crear todos los días del rango seleccionado
    if (this.fechaInicio && this.fechaFin) {
      const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

      diasRango.forEach((dia) => {
        let periodo: any = null;

        if (tipo === 'DIA') {
          periodo = {
            key: dia.key,
            label: dia.label,
          };
        } else {
          periodo = obtenerPeriodoDesdeKey(dia.key, tipo);
        }

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

            cantidadOperaciones: 0,
            cantidadRegistros: 0,
            cantidadRegistrosMtto: 0,
          });
        }
      });
    }

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      const fecha = op.fecha;

      if (!fecha) return;

      let periodo: any = null;

      if (tipo === 'DIA') {
        periodo = obtenerPeriodo(fecha, 'DIA');
      } else {
        periodo = obtenerPeriodo(fecha, tipo);
      }

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

    resultado.sort((a, b) => a.key.localeCompare(b.key));

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
}
