import { Component, Inject } from '@angular/core';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { PlanProduccionService } from '../../../../services/plan-produccion.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../services/toast.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-edit-plan-produccion',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
  ],
  templateUrl: './edit-plan-produccion.component.html',
  styleUrl: './edit-plan-produccion.component.css',
})
export class EditPlanProduccionComponent {
  programadoOptions: string[] = ['Programado', 'No Programado'];

  constructor(
    public dialogRef: MatDialogRef<EditPlanProduccionComponent>,
    @Inject(MAT_DIALOG_DATA) public plan: PlanProduccion,
    private planService: PlanProduccionService,
    private toast: ToastService,
  ) {}

  guardar(): void {
    if (this.plan.id !== undefined) {
      this.planService.updatePlanProduccion(this.plan.id, this.plan).subscribe({
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
