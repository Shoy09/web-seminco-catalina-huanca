import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-editar-perfil-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './editar-perfil-dialog.component.html',
  styleUrl: './editar-perfil-dialog.component.css',
})
export class EditarPerfilDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() usuario: any | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() guardarPerfil = new EventEmitter<any>();

  formularioUsuario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formularioUsuario = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      cargo: ['', Validators.required],
      empresa: ['', Validators.required],
      guardia: ['', Validators.required],
      equipoAutorizado: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],

      // Si quieres que sea obligatoria, agrega Validators.required
      contraseña: ['', [Validators.minLength(6)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      this.formularioUsuario.patchValue({
        nombre: this.usuario.nombre || this.usuario.nombres || '',
        apellidos: this.usuario.apellidos || '',
        cargo: this.usuario.cargo || '',
        empresa: this.usuario.empresa || '',
        guardia: this.usuario.guardia || '',
        equipoAutorizado: this.usuario.equipoAutorizado || this.usuario.autorizado_equipo || '',
        correo: this.usuario.correo || '',
        contraseña: '',
      });

      this.formularioUsuario.markAsPristine();
      this.formularioUsuario.markAsUntouched();
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.formularioUsuario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  obtenerError(campo: string): string {
    const control = this.formularioUsuario.get(campo);

    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['email']) return 'Ingrese un correo válido.';
    if (control.errors['minlength']) {
      return `Debe tener mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    return 'Campo inválido.';
  }

  guardarCambios(): void {
    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }

    const data = { ...this.formularioUsuario.value };

    // Si no cambió contraseña, no la mandes
    if (!data.contraseña) {
      delete data.contraseña;
    }

    this.guardarPerfil.emit(data);
  }

  cerrar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}