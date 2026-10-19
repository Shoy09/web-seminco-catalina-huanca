import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Equipo } from 'app/models/equipo.model';
import { Estado } from 'app/models/Estado';
import { OperacionesService } from 'app/services/operaciones.service';
import { EquipoService } from 'app/services/equipo.service';
import { EstadoService } from 'app/services/estado.service';
import { DashboardLoadingComponent } from '../../shared/dashboard-loading/dashboard-loading.component';
import { DashboardUtilitarioComponent } from './dashboard-utilitario.component';
import {
  DetalleUtilitario, OperacionUtilitario, construirFilas, indicadoresUtilitario, normalizarOperaciones,
} from './utilitario-indicadores';

@Component({
  selector: 'app-principal-grafico-utilitario', standalone: true,
  imports: [CommonModule, FormsModule, DashboardUtilitarioComponent, DashboardLoadingComponent],
  templateUrl: './principal-grafico-utilitario.component.html',
  styleUrl: './principal-grafico-utilitario.component.css',
})
export class PrincipalGraficoUtilitarioComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly operacionesService = inject(OperacionesService);
  private readonly equipoService = inject(EquipoService);
  private readonly estadoService = inject(EstadoService);
  readonly PROCESO = 'SCISSOR';
  operacionesOriginal: OperacionUtilitario[] = [];
  operacionesFiltradas: OperacionUtilitario[] = [];
  estadosProceso: Estado[] = [];
  equipos: Equipo[] = [];
  fechaInicio = '';
  fechaFin = '';
  turnoSeleccionado = '';
  equipoSeleccionado = '';
  cargando = false;
  exportando = false;
  errorCarga = '';
  errorFiltro = '';
  errorEquipos = '';
  errorExportacion = '';
  showZoom = false;

  ngOnInit(): void {
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    this.fechaInicio = fecha;
    this.fechaFin = fecha;
    this.turnoSeleccionado = hoy.getHours() >= 7 && hoy.getHours() < 19 ? 'DÍA' : 'NOCHE';
    this.cargarOperaciones();
    this.cargarEquipos();
  }

  cargarOperaciones(): void {
    if (this.cargando) return;
    this.cargando = true;
    this.errorCarga = '';
    forkJoin({
      operaciones: this.operacionesService.getAllAprobados<DetalleUtilitario>('scissor'),
      estados: this.estadoService.getEstadosByProceso(this.PROCESO),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ operaciones, estados }) => {
        this.operacionesOriginal = normalizarOperaciones(operaciones.data || []);
        this.estadosProceso = estados;
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = 'No se pudieron cargar las operaciones aprobadas o el catálogo de estados de Utilitario.';
      },
    });
  }

  cargarEquipos(): void {
    this.errorEquipos = '';
    this.equipoService.getEquiposByProceso(this.PROCESO).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: equipos => this.equipos = equipos,
      error: () => this.errorEquipos = 'No se pudo cargar el catálogo de equipos. Puedes consultar todos los equipos o reintentar.',
    });
  }

  get equiposDisponibles(): string[] {
    return [...new Set(this.equipos.filter(e => e.proceso?.trim().toUpperCase() === this.PROCESO)
      .map(e => e.codigo?.trim() || '').filter(Boolean))].sort();
  }

  aplicarFiltro(): void {
    this.errorFiltro = '';
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      this.errorFiltro = 'La fecha inicial debe ser anterior o igual a la fecha final.';
      return;
    }
    this.operacionesFiltradas = this.operacionesOriginal.filter(op => {
      const fecha = String(op.fecha || '').slice(0, 10);
      return (!this.fechaInicio || fecha >= this.fechaInicio) && (!this.fechaFin || fecha <= this.fechaFin)
        && (!this.turnoSeleccionado || op.turno === this.turnoSeleccionado)
        && (!this.equipoSeleccionado || op.n_equipo === this.equipoSeleccionado);
    });
  }

  quitarFiltro(): void {
    this.fechaInicio = this.fechaFin = this.turnoSeleccionado = this.equipoSeleccionado = '';
    this.errorFiltro = '';
    this.operacionesFiltradas = [...this.operacionesOriginal];
  }

  async exportarExcel(): Promise<void> {
    if (this.exportando || !this.operacionesFiltradas.length) return;
    this.exportando = true;
    this.errorExportacion = '';
    try {
      const XLSX = await import('xlsx');
      const filas = construirFilas(this.operacionesFiltradas, this.estadosProceso);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas.map(f => ({
        Fecha: f.fecha, Turno: f.turno, Equipo: f.equipo, Guardia: f.guardia, Operador: f.operador,
        Código: f.codigo, Actividad: f.actividad, Estado: f.familia, Inicio: f.inicio, Final: f.final,
        Horas: f.horas, 'Labor de origen': f.labor, Observación: f.observacion,
      }))), 'Registros');
      XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(indicadoresUtilitario(filas, 'equipo')), 'Indicadores por equipo');
      XLSX.writeFile(libro, `Utilitario_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      this.errorExportacion = 'No se pudo generar el Excel. Inténtalo nuevamente.';
    } finally {
      this.exportando = false;
    }
  }
}
