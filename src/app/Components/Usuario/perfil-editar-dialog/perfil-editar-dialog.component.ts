import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-perfil-editar-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './perfil-editar-dialog.component.html',
  styles: [`
    :host ::ng-deep .compact-field .mat-mdc-form-field-subscript-wrapper { display: none; }
    :host ::ng-deep .compact-field .mat-mdc-form-field-infix { padding-top: 10px; padding-bottom: 10px; min-height: unset; }
  `],
})
export class PerfilEditarDialogComponent {
  form: FormGroup;
  mostrarContrasena = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PerfilEditarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.form = this.fb.group({
      nombre:          [data?.nombre          ?? '', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      apellidos:       [data?.apellidos       ?? '', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      cargo:           [data?.cargo           ?? '', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      empresa:         [data?.empresa         ?? '', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      guardia:         [data?.guardia         ?? '', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      equipoAutorizado:[data?.equipoAutorizado ?? '', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      correo:          [data?.correo          ?? '', [Validators.required, Validators.email]],
      contraseña:      ['', [Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)]],
    });
  }

  obtenerError(campo: string): string {
    const ctrl = this.form.get(campo);
    if (ctrl?.hasError('required'))  return 'Este campo es obligatorio.';
    if (ctrl?.hasError('email'))     return 'Correo inválido (ej. usuario@dominio.com).';
    if (ctrl?.hasError('minlength')) return 'Mínimo 6 caracteres.';
    if (ctrl?.hasError('pattern')) {
      if (campo === 'contraseña') return 'Debe tener mayúscula, minúscula y número.';
      return 'Solo se permiten letras y espacios.';
    }
    return '';
  }

  guardar() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
