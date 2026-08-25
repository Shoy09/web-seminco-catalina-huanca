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

  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';

  mostrarFiltros: boolean = false;

  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  opcionesPagina: number[] = [10, 15, 20];

  get totalPaginas(): number {
    return Math.ceil(this.operacionesFiltradas.length / this.registrosPorPagina);
  }

  get operacionesPaginadas(): OperacionBase[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.operacionesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  constructor(
    private operacionesService: OperacionesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const nombre = this.authService.getNombreCompleto();
    if (!nombre) { console.error('No se encontró el jefe de guardia'); return; }
    this.jefe_guardia = nombre;
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.operacionesService.getAll(this.tipo).subscribe({
      next: (resp: any) => {
        this.operacionesOriginal = resp.data;
        this.operacionesFiltradas = [...this.operacionesOriginal]
          .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : (b.id ?? 0) - (a.id ?? 0)));
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  aplicarFiltro() {
    this.turnoAplicado = this.turnoSeleccionado;
    this.operacionesFiltradas = this.operacionesOriginal
      .filter((op) => {
        if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
        if (this.fechaFin && op.fecha > this.fechaFin) return false;
        if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
        return true;
      })
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : (b.id ?? 0) - (a.id ?? 0)));
    this.mostrarFiltros = false;
    this.paginaActual = 1;
  }

  quitarFiltro() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.turnoAplicado = '';
    this.turnoSeleccionado = '';
    this.mostrarFiltros = false;
    this.paginaActual = 1;
    this.operacionesFiltradas = [...this.operacionesOriginal]
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : (b.id ?? 0) - (a.id ?? 0)));
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
  }

  cambiarRegistrosPorPagina(cantidad: number | string): void {
    this.registrosPorPagina = +cantidad;
    this.paginaActual = 1;
  }

  getStatusClass(op: OperacionBase): string {
    if (op.aprobacion === 1) return 'approved';
    if (op.aprobacion === 2) return 'rejected';
    return 'pending';
  }

  getStatusText(op: OperacionBase): string {
    if (op.aprobacion === 1) return 'Aprobado';
    if (op.aprobacion === 2) return 'Rechazado';
    return 'Pendiente';
  }

  getRevisionClass(op: OperacionBase): string {
    if (!op.revisado || op.revisado === 0) return 'revision-pending';
    if (op.revisado === 1) return 'revision-one';
    if (op.revisado === 2) return 'revision-two';
    if (op.revisado >= 3) return 'revision-completed';
    return 'revision-pending';
  }

  getRevisionText(op: OperacionBase): string {
    if (!op.revisado || op.revisado === 0) return 'Sin revisión';
    if (op.revisado === 1) return '1ra revisión';
    if (op.revisado === 2) return '2da revisión';
    if (op.revisado >= 3) return `${op.revisado} revisiones`;
    return 'Sin revisión';
  }

  getReviewClass(op: OperacionBase): string {
    if (op.aprobacion === 1) return 'approved';
    if (op.aprobacion === 2) return 'rejected';
    return 'pending';
  }

  getTurnoClass(turno: string): string {
    const t = turno?.toLowerCase() || '';
    if (t.includes('mañana') || t.includes('morning')) return 'morning';
    if (t.includes('tarde') || t.includes('afternoon')) return 'afternoon';
    if (t.includes('noche') || t.includes('night')) return 'night';
    return '';
  }

  irDetalle(op: OperacionBase) {
    this.router.navigate(['/Dashboard/jefe-mina/scooptram/operacion', op.id]);
  }
}
