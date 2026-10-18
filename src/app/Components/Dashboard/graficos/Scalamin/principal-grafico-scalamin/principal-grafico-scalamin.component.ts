import { PresentacionMmtoScalaminComponent } from '../presentacion-mmto-scalamin/presentacion-mmto-scalamin.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Equipo } from 'app/models/equipo.model';
import { OperacionBaseScalamin } from 'app/models/OperacionBase.models';
import { OperacionScalamin } from 'app/models/OperacionScalamin';
import { PlanProduccion } from 'app/models/plan_produccion.model';
import { EquipoService } from 'app/services/equipo.service';
import { EstadoService } from 'app/services/estado.service';
import { ExcelTaladroLargoExportService } from 'app/services/Excel/excel-taladro-largo-export.service';
import { FechasPlanMensualService } from 'app/services/fechas-plan-mensual.service';
import { OperacionesService } from 'app/services/operaciones.service';
import { PlanMensualService } from 'app/services/plan-mensual.service';
import { PlanProduccionService } from 'app/services/plan-produccion.service';
import { ExcelImportService } from 'app/services/subir data/excel-operacion-mapper-scoops.service';
import { SchedulerComponent } from '../../Linea de tiempo/scheduler/scheduler.component';
import { ExcelScalaminExportService } from 'app/services/export/excel-export-scalamin.service';
import { PresentacionGefeGuardiaScalaminComponent } from '../presentacion-gefe-guardia-scalamin/presentacion-gefe-guardia-scalamin.component';
import { DashboardScalaminComponent } from './dashboard-scalamin.component';
import { Estado } from 'app/models/Estado';
import { DashboardLoadingComponent } from '../../shared/dashboard-loading/dashboard-loading.component';

@Component({
  selector: 'app-principal-grafico-scalamin',
  imports: [CommonModule, FormsModule, DashboardScalaminComponent, DashboardLoadingComponent ],
  templateUrl: './principal-grafico-scalamin.component.html',
  styleUrl: './principal-grafico-scalamin.component.css'
})
export class PrincipalGraficoScalaminComponent implements OnInit {
  estadosProceso: Estado[] = [];
  equipoSeleccionado = '';
  equipoAplicado = '';
  cargando = false;
  errorCarga = '';
  errorFiltro = '';
  anio!: number;
  mes!: string;
  showZoom: boolean = false;

  // DATA ORIGINAL (sin filtrar)
  operacionesOriginal: OperacionBaseScalamin[] = [];
  operacionesFiltradas: OperacionBaseScalamin[] = [];

  planesMensuales: PlanProduccion[] = [];

    fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';
equipos: Equipo[] = [];
  private readonly PROCESO = 'SCALAMIN';

constructor(
    private planMensualService: PlanProduccionService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService,
    private dialog: MatDialog,
    private equipoService: EquipoService,
    private excelExportService: ExcelScalaminExportService
  ) {}

  ngOnInit(): void {
    // 🔥 SETEO AUTOMÁTICO
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();

    this.cargarOperaciones();
    this.cargarEquipos();
    this.estadoService.getEstadosByProceso(this.PROCESO).subscribe({
      next: estados => this.estadosProceso = estados,
      error: () => this.estadosProceso = [],
    });
  }
  toggleDataZoom(): void {
    this.showZoom = !this.showZoom;
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
      const tipo = 'scalamin';
      this.cargando = true;
      this.errorCarga = '';
  
      this.operacionesService.getAllAprobados<OperacionScalamin>(tipo).subscribe({
        next: (resp) => {
          this.operacionesOriginal = resp.data;
          this.cargando = false;
  
          console.log('🔥 DATA OPERACIONES:', this.operacionesOriginal);
  
          // 🔥 SOLO ESTO
          this.aplicarFiltro();
        },
        error: (err) => {
          this.cargando = false;
          this.errorCarga = 'No se pudieron cargar las operaciones de Scalamin.';
          //console.error('❌ Error al obtener operaciones:', err);
        },
      });
    }
  
    // =========================================
    // 🔥 FILTRO POR FECHA
    // =========================================
    aplicarFiltro() {
      this.errorFiltro = '';
      if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
        this.errorFiltro = 'La fecha inicial debe ser anterior o igual a la fecha final.';
        return;
      }
      this.equipoAplicado = this.equipoSeleccionado;
      this.turnoAplicado = this.turnoSeleccionado; // 🔥 CLAVE
  
      this.operacionesFiltradas = this.operacionesOriginal.filter((op) => {
        const fecha = String(op.fecha || '').slice(0, 10);
        if (this.fechaInicio && fecha < this.fechaInicio) return false;
        if (this.fechaFin && fecha > this.fechaFin) return false;
        if (this.equipoAplicado && op.n_equipo !== this.equipoAplicado) return false;
  
        if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
  
        return true;
      });
      console.log('🔥 OPERACIONES FILTRADAS:', this.operacionesFiltradas);
  
    }
  
    quitarFiltro() {
      this.equipoSeleccionado = '';
      this.equipoAplicado = '';
      this.errorFiltro = '';
      this.operacionesFiltradas = [...this.operacionesOriginal];
      this.fechaInicio = '';
      this.fechaFin = '';
      this.turnoAplicado = '';
      this.turnoSeleccionado = '';
  
    }

    get equiposDisponibles(): string[] {
      return [...new Set(this.equipos
        .filter(equipo => equipo.proceso?.trim().toUpperCase() === this.PROCESO)
        .map(equipo => equipo.codigo?.trim() || '')
        .filter(Boolean))].sort();
    }

    cargarEquipos() {
  this.equipoService.getEquiposByProceso(this.PROCESO)
    .subscribe({
      next: (equipos: Equipo[]) => {
        this.equipos = equipos;         // 👈 guardar
      },
      error: err => console.error('Error equipos:', err)
    });
}

  
    exportarExcel() {
    this.excelExportService.exportOperacionesToExcel(
      this.operacionesFiltradas, 
      'Operaciones',
      this.equipos  
    );
  }

    presentarMmto(): void {
    this.dialog.open(PresentacionMmtoScalaminComponent, {
      width: '1400px',
      maxWidth: 'calc(100vw - 16px)',
      maxHeight: '100dvh',
      panelClass: 'guardia-presentation-dialog',
      data: {
        operaciones: this.operacionesFiltradas,
        proceso: 'Scalamin',
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
    
      const dialogRef = this.dialog.open(PresentacionGefeGuardiaScalaminComponent, {
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
