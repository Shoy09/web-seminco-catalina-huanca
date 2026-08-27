import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-usuario-dialog',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './usuario-dialog.component.html',
  styleUrl: './usuario-dialog.component.css'
})
export class UsuarioDialogComponent {
  usuarioForm: FormGroup;
  editMode = false;
  cambiarPassword = false;
  operacionesDisponibles = [
    'ACARREO',
    'CARGUÍO',
    'EXPLOSIVOS',
    'MEDICIONES',
    'SOSTENIMIENTO',
    'SERVICIOS AUXILIARES',
    'ACEROS DE PERFORACIÓN',
    'PERFORACIÓN HORIZONTAL',
    'PERFORACIÓN TALADROS LARGOS'
  ];
  cargos: string[] = [
  'JEFE GUARDIA',
  'Op. Robot',
  'Op. Bolter',
  'Op. Mixer',
  'Ayudante'
];


  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    public dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario
  ) {
    this.editMode = !!data;

    // Convertir el rol del backend al valor del frontend para el select
    const rolFrontend = data?.rol ? (this.rolAFrontend[data.rol] ?? data.rol) : '';

    // Convertir operaciones_autorizadas a array de strings para el select multiple
    // El backend puede enviarlas como string JSON o como objeto {key: boolean}
    const operacionesArray = this.parsearOperaciones(data?.operaciones_autorizadas);

    this.usuarioForm = this.fb.group(
      {
        codigo_dni: [data?.codigo_dni || '', Validators.required],
        apellidos: [data?.apellidos || '', Validators.required],
        nombres: [data?.nombres || '', Validators.required],
        correo: [data?.correo || '', [Validators.required, Validators.email]],
        cargo: [data?.cargo || ''],
        empresa: [data?.empresa || ''],
        guardia: [data?.guardia || ''],
        autorizado_equipo: [data?.autorizado_equipo || ''],
        rol: [rolFrontend, Validators.required],
        operaciones_autorizadas: [operacionesArray],
      },
      { validators: this.passwordsCoinciden }
    );
    
    if (!this.editMode) {
      this.usuarioForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
      this.usuarioForm.addControl('confirmPassword', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    }
  }

  /** Muestra u oculta los campos de nueva contraseña en modo editar */
  toggleCambiarPassword() {
    this.cambiarPassword = !this.cambiarPassword;

    if (this.cambiarPassword) {
      // Agregar controles con validación
      this.usuarioForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
      this.usuarioForm.addControl('confirmPassword', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    } else {
      // Quitar controles y limpiar errores
      this.usuarioForm.removeControl('password');
      this.usuarioForm.removeControl('confirmPassword');
    }
  }
  
  passwordsCoinciden(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { noCoincide: true };
  }

  /** Convierte operaciones_autorizadas a array de strings para el mat-select multiple.
   *  Acepta: string JSON, objeto {key: boolean}, o array (ya correcto). */
  private parsearOperaciones(valor: any): string[] {
    if (!valor) return [];

    // Caso 1: ya es un array
    if (Array.isArray(valor)) return valor;

    // Caso 2: string JSON → parsear a objeto
    if (typeof valor === 'string') {
      try {
        valor = JSON.parse(valor);
      } catch {
        return [];
      }
    }

    // Caso 3: objeto {key: boolean} → extraer solo las claves con valor true
    if (typeof valor === 'object') {
      return Object.keys(valor).filter(k => valor[k] === true);
    }

    return [];
  }
  
  // Mapeo frontend → backend
  private readonly rolABackend: Record<string, string> = {
    'Admin':      'admin',
    'Trabajador': 'user',
    'Master':     'supervisor',
    'OPERADOR':   'user',
  };

  // Mapeo backend → frontend
  private readonly rolAFrontend: Record<string, string> = {
    'admin':      'Admin',
    'user':       'Trabajador',
    'supervisor': 'Master',
    'operador':   'OPERADOR',
    // Valores ya en formato frontend (para tolerancia)
    'Admin':      'Admin',
    'Trabajador': 'Trabajador',
    'Master':     'Master',
    'OPERADOR':   'OPERADOR',
  };

guardar() {
  if (this.usuarioForm.valid) {
    const formValue = this.usuarioForm.value;

    const operacionesObj: { [key: string]: boolean } = {};
    if (Array.isArray(formValue.operaciones_autorizadas)) {
      formValue.operaciones_autorizadas.forEach((op: string) => {
        operacionesObj[op] = true;
      });
    }

    const usuarioData: any = {
      ...formValue,
      operaciones_autorizadas: JSON.stringify(operacionesObj),
      rol: this.rolABackend[formValue.rol] ?? formValue.rol,
    };

    // En modo editar, solo enviar password si el usuario decidió cambiarlo
    if (this.editMode && !this.cambiarPassword) {
      delete usuarioData.password;
      delete usuarioData.confirmPassword;
    }
    // Nunca enviar confirmPassword al backend
    delete usuarioData.confirmPassword;

    if (this.editMode) {
      this.usuarioService.actualizarUsuario(this.data.id!, usuarioData).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      this.usuarioService.crearUsuario(usuarioData).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
}


  cancelar() {
    this.dialogRef.close();
  }
} 
