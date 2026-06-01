import { Component } from '@angular/core';
import { PlanMensualService } from '../../../../../services/plan-mensual.service';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';
import { EstadoService } from '../../../../../services/estado.service';
import { ExcelImportService } from '../../../../../services/subir data/excel-operacion-mapper-scoops.service';
import { EquipoService } from '../../../../../services/equipo.service';
import { MatDialog } from '@angular/material/dialog';
import { getFechaHoy, getTurnoActual } from '../../../../../utils/fecha-utils';
import { Equipo } from '../../../../../models/equipo.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperacionBaseVolquete } from '../../../../../models/OperacionBase.models';
import { OperacionVolquete } from '../../../../../models/OperacionVolquete';
import { PresentacionAcarreoDialogComponent } from '../presentacion-acarreo-dialog/presentacion-acarreo-dialog.component';

@Component({
  selector: 'app-principal-grafico-acarreo',
  imports: [CommonModule, FormsModule],
  templateUrl: './principal-grafico-acarreo.component.html',
  styleUrl: './principal-grafico-acarreo.component.css',
})
export class PrincipalGraficoAcarreoComponent {
  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';
  cargandoPDF = false;
  vistaPrincipal: boolean = true;

  estadosProceso: any[] = [];
  equiposProceso: Equipo[] = [];
  mapaEstados: Map<string, any> = new Map();

  operacionesOriginal: OperacionBaseVolquete[] = [];
  operacionesFiltradas: OperacionBaseVolquete[] = [];

  constructor(
    private planMensualService: PlanMensualService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService,
    private excelImportService: ExcelImportService,
    private equipoService: EquipoService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    //this.obtenerUltimaFecha();

    // 🔥 SETEO AUTOMÁTICO
    const hoy = getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = getTurnoActual();

    this.cargarOperaciones();
    this.obtenerEstadosPorProceso('ACARREO');
    this.obtenerEquiposPorProceso('ACARREO');
  }

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

  cargarOperaciones() {
    const tipo = 'volquetes';

    this.operacionesService.getAllAprobados<OperacionVolquete>(tipo).subscribe({
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
  obtenerEquiposPorProceso(proceso: string) {
    this.equipoService.getEquiposByProceso(proceso).subscribe({
      next: (data) => {
        this.equiposProceso = data;

        console.log('Equipos por proceso:', data);
      },
      error: (err) => {
        console.error('Error al traer equipos por proceso', err);
      },
    });
  }

  procesarTodo() {
    /* if (!this.operacionesFiltradas.length || !this.planesMensuales.length)
      return; */
  }

  construirMapaEstados() {
    this.mapaEstados.clear();

    this.estadosProceso.forEach((e) => {
      const codigo = String(e.codigo || '').trim();
      this.mapaEstados.set(codigo, e);
    });

    //console.log('🧩 Mapa de estados construido:', this.mapaEstados.size);
  }
  Presentacion() {
    if (!this.operacionesFiltradas || this.operacionesFiltradas.length === 0) {
      console.warn('No hay datos filtrados para mostrar');
      return;
    }

    const dialogRef = this.dialog.open(PresentacionAcarreoDialogComponent, {
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
}
