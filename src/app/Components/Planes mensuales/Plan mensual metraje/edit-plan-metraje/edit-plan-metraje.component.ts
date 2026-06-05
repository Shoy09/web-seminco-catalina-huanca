import { Component, Inject } from '@angular/core';
import { PlanMetraje } from '../../../../models/plan_metraje.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlanMetrajeService } from '../../../../services/plan-metraje.service';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-edit-plan-metraje',
  imports: [FormsModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './edit-plan-metraje.component.html',
  styleUrl: './edit-plan-metraje.component.css',
})
export class EditPlanMetrajeComponent {
  programadoOptions: string[] = ['Programado', 'No Programado'];

  constructor(
    public dialogRef: MatDialogRef<EditPlanMetrajeComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMetraje,
    private planService: PlanMetrajeService,
    private toast: ToastService,
  ) {}

  guardar(): void {
    if (this.plan.id !== undefined) {
      this.planService.updatePlanMetraje(this.plan.id, this.plan).subscribe({
        next: (respuesta) => {
          this.toast.success('Plan actualizado con éxito', 'Éxito');
          this.dialogRef.close(respuesta); // Cierra el diálogo con los datos actualizados
        },
        error: (error) => {
          this.toast.error('Error al actualizar el plan', 'Error');
        },
      });
    } else {
      this.toast.warn('El plan no tiene un ID válido', 'Advertencia');
    }
  }

  cancelar(): void {
    this.dialogRef.close(); // Cerramos sin enviar cambios
  }
}
