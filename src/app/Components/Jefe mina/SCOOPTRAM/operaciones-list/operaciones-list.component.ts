import { Component, OnInit } from '@angular/core';
import { OperacionBase } from '../../../../models/OperacionBase.models';
import { OperacionesService } from '../../../../services/operaciones.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-operaciones-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './operaciones-list.component.html',
  styleUrl: './operaciones-list.component.css'
})
export class OperacionesListScooComponent implements OnInit {

  tipo: string = 'carguio';
  jefe_guardia: string = '';

  operacionesOriginal: OperacionBase[] = [];
  operacionesFiltradas: OperacionBase[] = [];
  loading = false;

  // Variables para el filtro de fechas
  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';

  constructor(
    private operacionesService: OperacionesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const nombre = this.authService.getNombreCompleto();

    if (!nombre) {
      console.error('No se encontró el jefe de guardia');
      return;
    }

    this.jefe_guardia = nombre;
    
    // 🔥 SETEO AUTOMÁTICO
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();

    this.cargarDatos();
  }

   // 🔥 OBTENER TURNO ACTUAL BASADO EN LA HORA
  private getTurnoActual(): string {
    const hora = new Date().getHours();

    // Día: 07:00 - 18:59
    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    }

    // Noche: 19:00 - 06:59
    return 'NOCHE';
  }

  // 🔥 OBTENER FECHA ACTUAL EN FORMATO YYYY-MM-DD
  private getFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarDatos() {
  this.loading = true;

  this.operacionesService
    .getAll(this.tipo) // 🔥 cambio aquí
    .subscribe({
      next: (resp: any) => {
        this.operacionesOriginal = resp.data;
        this.loading = false;

        this.aplicarFiltro();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
}

// =========================================
  // 🔥 FILTRO POR FECHA Y TURNO
  // =========================================
  aplicarFiltro() {
    this.turnoAplicado = this.turnoSeleccionado;

    this.operacionesFiltradas = this.operacionesOriginal.filter((op) => {
      // Filtro por fecha inicio
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      
      // Filtro por fecha fin
      if (this.fechaFin && op.fecha > this.fechaFin) return false;

      // Filtro por turno
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;

      return true;
    });
    
    console.log('🔥 OPERACIONES FILTRADAS:', this.operacionesFiltradas);
  }

  // 🔥 QUITAR TODOS LOS FILTROS
  quitarFiltro() {
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.fechaInicio = '';
    this.fechaFin = '';
    this.turnoAplicado = '';
    this.turnoSeleccionado = '';

    console.log('🔥 FILTROS ELIMINADOS, mostrando todas las operaciones');
  }

  // Métodos para el estado de aprobación
  getStatusClass(op: OperacionBase): string {
    if (op.aprobacion === 1) return 'approved';
    if (op.aprobacion === 2) return 'rejected';
    return 'pending'; // aprobacion === 0 o undefined
  }

  getStatusIcon(op: OperacionBase): string {
    if (op.aprobacion === 1) return '✓';
    if (op.aprobacion === 2) return '✗';
    return '⏳';
  }

  getStatusText(op: OperacionBase): string {
    if (op.aprobacion === 1) return 'Aprobado';
    if (op.aprobacion === 2) return 'Rechazado';
    return 'Pendiente';
  }

  // Métodos para el estado de revisión
  getRevisionClass(op: OperacionBase): string {
    if (!op.revisado || op.revisado === 0) return 'revision-pending';
    if (op.revisado === 1) return 'revision-one';
    if (op.revisado === 2) return 'revision-two';
    if (op.revisado && op.revisado >= 3) return 'revision-completed';
    return 'revision-pending';
  }

  getRevisionIcon(op: OperacionBase): string {
    if (!op.revisado || op.revisado === 0) return '📝';
    if (op.revisado === 1) return '🔄';
    if (op.revisado === 2) return '🔄';
    if (op.revisado && op.revisado >= 3) return '✅';
    return '📝';
  }

  getRevisionText(op: OperacionBase): string {
    if (!op.revisado || op.revisado === 0) return 'Sin revisión';
    if (op.revisado === 1) return '1ra revisión';
    if (op.revisado === 2) return '2da revisión';
    if (op.revisado && op.revisado >= 3) return `${op.revisado} revisiones`;
    return 'Sin revisión';
  }

  getReviewIcon(op: OperacionBase): string {
    if (op.aprobacion === 1) return '✓';
    if (op.aprobacion === 2) return '✗';
    return '⏳';
  }

  getReviewClass(op: OperacionBase): string {
    if (op.aprobacion === 1) return 'approved';
    if (op.aprobacion === 2) return 'rejected';
    return 'pending';
  }

  // Método auxiliar para el turno
  getTurnoClass(turno: string): string {
    const turnoLower = turno?.toLowerCase() || '';
    if (turnoLower.includes('mañana') || turnoLower.includes('morning')) return 'morning';
    if (turnoLower.includes('tarde') || turnoLower.includes('afternoon')) return 'afternoon';
    if (turnoLower.includes('noche') || turnoLower.includes('night')) return 'night';
    return '';
  }
  
  irDetalle(op: OperacionBase) {
  this.router.navigate([
    '/Dashboard/jefe-mina/scooptram/operacion',
    op.id
  ]);
}
}