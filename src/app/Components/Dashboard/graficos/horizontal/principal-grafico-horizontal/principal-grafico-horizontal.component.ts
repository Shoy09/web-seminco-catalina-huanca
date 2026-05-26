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

@Component({
  selector: 'app-principal-grafico-horizontal',
  imports: [
    FormsModule,
    SchedulerComponent,
    CommonModule
],
  templateUrl: './principal-grafico-horizontal.component.html',
  styleUrl: './principal-grafico-horizontal.component.css'
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
  dataDisparosEquipo: any[] = [];  // 👈 NUEVO
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
    totalMetros: 0
  };

  datosGraficoEstados: any[] = [];

  ganttData: any[] = [];

  actividadesData = [
  // J-14
  { recurso: 'J-14', actividad: 'DES', inicio: 12, fin: 16, label: '' },
  { recurso: 'J-14', actividad: 'FRENTE COMPLETO', inicio: 7, fin: 12, label: '' },
  { recurso: 'J-14', actividad: 'FRENTE COMPLETO', inicio: 16, fin: 19, label: '' },
  
  // J-19
  { recurso: 'J-19', actividad: 'FRENTE COMPLETO', inicio: 7, fin: 10, label: '' },
  { recurso: 'J-19', actividad: 'BREASTING', inicio: 10, fin: 14, label: '' },
  { recurso: 'J-19', actividad: 'FRENTE COMPLETO', inicio: 14, fin: 19, label: '' },
  
  // J-20
  { recurso: 'J-20', actividad: 'DES', inicio: 7, fin: 9, label: 'bombeo de agua' },
  { recurso: 'J-20', actividad: 'FRENTE COMPLETO', inicio: 9, fin: 13, label: '' },
  { recurso: 'J-20', actividad: 'BREASTING', inicio: 13, fin: 17, label: '' },
  { recurso: 'J-20', actividad: 'FRENTE COMPLETO', inicio: 17, fin: 19, label: '' }
];
dataPromedioEstados: any;
cargandoPDF = false;
vistaPrincipal: boolean = true;
estadosProceso: any[] = [];

  constructor(
    private planMensualService: PlanMensualService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService
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
  this.estadoService.getEstadosByProceso(proceso)
    .subscribe({
      next: (data) => {
        this.estadosProceso = data;
       //console.log('Estados por proceso:', data);

        // 🔥 CLAVE
        this.construirMapaEstados();
      },
      error: (err) => {
        console.error('Error al traer estados por proceso', err);
      }
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
    }
  });
}

  // =========================================
  // 🔥 FILTRO POR FECHA
  // =========================================
aplicarFiltro() {

  this.turnoAplicado = this.turnoSeleccionado; // 🔥 CLAVE

  this.operacionesFiltradas = this.operacionesOriginal.filter(op => {

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
      }
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
      }
    });
  }

  // =========================================
  // 🔥 PROCESAMIENTO TOTAL
  // =========================================
  procesarTodo() {
    if (!this.operacionesFiltradas.length || !this.planesMensuales.length) return;

 

    //console.log('🔥 DATA DISPAROS EQUIPO:', this.dataDisparosEquipo);
  }

estadosBloqueados = ['FUERA DE PLAN'];

mapaEstados: Map<string, any> = new Map();

construirMapaEstados() {
  this.mapaEstados.clear();

  this.estadosProceso.forEach(e => {
    const codigo = String(e.codigo || '').trim();
    this.mapaEstados.set(codigo, e);
  });

 //console.log('🧩 Mapa de estados construido:', this.mapaEstados.size);
}
}