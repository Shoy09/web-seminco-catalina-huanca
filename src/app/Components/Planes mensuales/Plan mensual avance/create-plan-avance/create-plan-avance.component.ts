import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PlanMensualService } from '../../../../services/plan-mensual.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../../../services/toast.service';
@Component({
  selector: 'app-create-plan-avance',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './create-plan-avance.component.html',
  styleUrl: './create-plan-avance.component.css',
})
export class CreatePlanAvanceComponent {
  planForm: FormGroup;
  camposDinamicos: string[] = []; // Aquí guardamos los campos 1A - 28B

  constructor(
    private fb: FormBuilder,
    private planMensualService: PlanMensualService, // Inyectar el servicio
    public dialogRef: MatDialogRef<CreatePlanAvanceComponent>,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.camposDinamicos = this.generarCamposDinamicos();

    this.planForm = this.fb.group({
      anio: [{ value: data.anio, disabled: true }],
      mes: [{ value: data.mes, disabled: true }],
      minado_tipo: [''],
      empresa: [''],
      zona: [''],
      area: [''],
      tipo_mineral: [''],
      fase: [''],
      estructura_veta: [''],
      nivel: [''],
      tipo_labor: [''],
      labor: [''],
      ala: [''],
      programado: [{ value: 'No Programado', disabled: true }],
      avance_m: [''],
      ancho_m: [''],
      alto_m: [''],
      tms: [''],
    });

    this.camposDinamicos.forEach((campo) => {
      this.planForm.addControl(campo, this.fb.control(''));
    });
  }
  generarCamposDinamicos(): string[] {
    const campos = [];
    for (let i = 1; i <= 28; i++) {
      campos.push(`${i}A`);
      campos.push(`${i}B`);
    }
    return campos;
  }
  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.planForm.valid) {
      // Habilitar campos deshabilitados para que se incluyan en `value`
      this.planForm.get('anio')?.enable();
      this.planForm.get('mes')?.enable();
      this.planForm.get('programado')?.enable();

      // Obtener valores del formulario
      const formData = this.planForm.value;

      // Transformar claves de "1A" a "col_1A", "1B" a "col_1B", etc.
      const nuevoPlan: any = {
        anio: formData.anio,
        mes: formData.mes,
        minado_tipo: formData.minado_tipo,
        empresa: formData.empresa,
        zona: formData.zona,
        area: formData.area,
        tipo_mineral: formData.tipo_mineral,
        fase: formData.fase,
        estructura_veta: formData.estructura_veta,
        nivel: formData.nivel,
        tipo_labor: formData.tipo_labor,
        labor: formData.labor,
        ala: formData.ala,
        programado: formData.programado,
        avance_m: formData.avance_m,
        ancho_m: formData.ancho_m,
        alto_m: formData.alto_m,
        tms: formData.tms,
      };

      // Mapear los valores dinámicos a la estructura correcta
      for (let i = 1; i <= 28; i++) {
        nuevoPlan[`col_${i}A`] = formData[`${i}A`] || null;
        nuevoPlan[`col_${i}B`] = formData[`${i}B`] || null;
      }

      this.planMensualService.createPlanMensual(nuevoPlan).subscribe({
        next: (response) => {
          this.toast.success('Plan creado exitosamente', 'Éxito'); // ✅ Notificación de éxito
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.toast.error('Hubo un problema al crear el plan', 'Error'); // ❌ Notificación de error
        },
      });
    } else {
      this.toast.warn(
        'Advertencia',
        'Por favor, complete todos los campos requeridos',
      ); // ⚠️ Campos incompletos
    }
  }
}
