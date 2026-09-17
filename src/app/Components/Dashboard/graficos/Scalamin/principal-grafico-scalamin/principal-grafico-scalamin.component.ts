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

@Component({
  selector: 'app-principal-grafico-scalamin',
  imports: [CommonModule, FormsModule ],
  templateUrl: './principal-grafico-scalamin.component.html',
  styleUrl: './principal-grafico-scalamin.component.css'
})
export class PrincipalGraficoScalaminComponent implements OnInit {
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

constructor(
    private planMensualService: PlanProduccionService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService,
    private dialog: MatDialog,
    private excelExportService: ExcelScalaminExportService
  ) {}

  ngOnInit(): void {
    // 🔥 SETEO AUTOMÁTICO
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();

    this.cargarOperaciones();
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
  
      this.operacionesService.getAllAprobados<OperacionScalamin>(tipo).subscribe({
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
  
    }
  
    quitarFiltro() {
      this.operacionesFiltradas = [...this.operacionesOriginal];
      this.fechaInicio = '';
      this.fechaFin = '';
      this.turnoAplicado = '';
      this.turnoSeleccionado = '';
  
    }
  
    exportarExcel() {
    this.excelExportService.exportOperacionesToExcel(
      this.operacionesFiltradas, 
      'Operaciones'
    );
  }
}