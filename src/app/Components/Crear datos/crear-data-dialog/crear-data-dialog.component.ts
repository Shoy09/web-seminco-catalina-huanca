import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CrearDataDialogData {
  categoria: any;   // el objeto de buttonc (nombre, tipo, campos, datos)
  editando: boolean;
  dato?: any;       // dato a editar (solo en modo edición)
}

@Component({
  selector: 'app-crear-data-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './crear-data-dialog.component.html',
})
export class CrearDataDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CrearDataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CrearDataDialogData,
  ) {
    // Construir controles dinámicamente a partir de los campos de la categoría
    const controls: Record<string, any> = {};
    for (const campo of data.categoria.campos) {
      controls[campo.nombre] = [data.dato?.[campo.nombre] ?? ''];
    }
    this.form = this.fb.group(controls);
  }

  onCampoChange(nombreCampo: string) {
    // Hook para lógica dinámica entre campos (ej. filtrar opciones)
  }

  guardar() {
    if (this.form.valid) {
      this.dialogRef.close({ accion: this.data.editando ? 'editar' : 'crear', valores: this.form.value });
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
