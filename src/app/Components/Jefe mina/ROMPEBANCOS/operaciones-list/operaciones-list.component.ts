import { Component, OnInit } from '@angular/core';
import { OperacionBase } from '../../../../models/OperacionBase.models';
import { OperacionesService } from '../../../../services/operaciones.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operaciones-list',
  imports: [CommonModule],
  templateUrl: './operaciones-list.component.html',
  styleUrl: './operaciones-list.component.css'
})
export class OperacionesListRompebancosComponent implements OnInit {

  tipo: string = 'rompebanco';
  jefe_guardia: string = '';

  operaciones: OperacionBase[] = [];
  loading = false;

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
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;

    this.operacionesService
      .getPorJefe(this.tipo, this.jefe_guardia)
      .subscribe({
        next: (resp: any) => {
          this.operaciones = resp.data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
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
    '/Dashboard/jefe-mina/rompebancos/operacion',
    op.id
  ]);
}

}