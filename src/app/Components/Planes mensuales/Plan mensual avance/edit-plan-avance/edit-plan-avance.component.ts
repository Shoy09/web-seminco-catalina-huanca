import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { PlanMensualService } from '../../../../services/plan-mensual.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastService } from '../../../../services/toast.service';
@Component({
  selector: 'app-edit-plan-avance',
  imports: [FormsModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './edit-plan-avance.component.html',
  styleUrl: './edit-plan-avance.component.css',
})
export class EditPlanAvanceComponent {
  programadoOptions: string[] = ['Programado', 'No Programado'];

  constructor(
    public dialogRef: MatDialogRef<EditPlanAvanceComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanMensual,
    private planService: PlanMensualService,
    private toast: ToastService,
  ) {}

  guardar(): void {
    if (this.plan.id !== undefined) {
      this.planService.updatePlanMensual(this.plan.id, this.plan).subscribe({
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
