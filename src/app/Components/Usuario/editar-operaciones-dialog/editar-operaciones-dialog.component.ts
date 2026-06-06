import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { UsuarioService } from '../../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-editar-operaciones-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
  ],
  templateUrl: './editar-operaciones-dialog.component.html',
  styleUrls: ['./editar-operaciones-dialog.component.css'],
})
export class EditarOperacionesDialogComponent implements OnInit {
  operacionesDisponibles = [
    'ACARREO',
    'CARGUÍO',
    'EXPLOSIVOS',
    'MEDICIONES',
    'SOSTENIMIENTO',
    'SERVICIOS AUXILIARES',
    'ACEROS DE PERFORACIÓN',
    'PERFORACIÓN HORIZONTAL',
    'PERFORACIÓN TALADROS LARGOS',
  ];

  operacionesSeleccionadas: { [key: string]: boolean } = {};

  constructor(
    private usuarioService: UsuarioService,
    public dialogRef: MatDialogRef<EditarOperacionesDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      operacionesAutorizadas: { [key: string]: boolean };
    },
  ) {}

  ngOnInit() {
    console.log('Datos recibidos en el diálogo:', this.data);

    // Inicializa todas en false
    this.operacionesDisponibles.forEach((op) => {
      this.operacionesSeleccionadas[op] = false;
    });

    // Si ya vienen operaciones autorizadas, inicializamos con ellas
    if (this.data.operacionesAutorizadas) {
      for (const key in this.data.operacionesAutorizadas) {
        if (this.operacionesSeleccionadas.hasOwnProperty(key)) {
          this.operacionesSeleccionadas[key] =
            this.data.operacionesAutorizadas[key];
        }
      }
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  guardar() {
    // Mostramos en consola exactamente lo que se enviará
    console.log('Enviando a la API:', {
      id: this.data.id,
      operaciones_autorizadas: this.operacionesSeleccionadas,
    });

    this.usuarioService
      .actualizarOperacionesAutorizadas(
        this.data.id,
        this.operacionesSeleccionadas,
      )
      .subscribe(() => {
        this.dialogRef.close('actualizado');
      });
  }
}
