import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { OpcionesDialogComponent } from '../opciones-dialog/opciones-dialog.component';
import { SeleccionProcesoEstatosDialogComponent } from '../../../Estado/seleccion-proceso-estatos-dialog/seleccion-proceso-estatos-dialog.component';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-seleccion-proceso-dialog',
  imports: [
    MatDialogModule,
    CommonModule,
    ButtonModule,
    RippleModule,
  ],
  templateUrl: './seleccion-proceso-dialog.component.html',
  styleUrl: './seleccion-proceso-dialog.component.css',
})
export class SeleccionProcesoDialogComponent {
  procesos = [
    {
      nombre: 'PERFORACIÓN TALADROS LARGOS',
      categorias: ['ANTES', 'MPI', 'VERIFICAR', 'MPF'],
    },
    {
      nombre: 'PERFORACIÓN HORIZONTAL',
      categorias: ['ANTES', 'MPI', 'VERIFICAR', 'MPF'],
    },
    {
      nombre: 'EMPERNADOR',
      categorias: ['ANTES', 'MPI', 'VERIFICAR', 'MPF'],
    },
    {
      nombre: 'SCISSOR',
      categorias: ['ANTES', 'MPI', 'VERIFICAR', 'MPF'],
    },
    {
      nombre: 'SCALAMIN',
      categorias: ['ANTES', 'MPI', 'VERIFICAR', 'MPF'],
    },
    {
      nombre: 'ROMPEBANCOS',
      categorias: ['ANTES', 'MPI', 'VERIFICAR', 'MPF'],
    },
    {
      nombre: 'ANFOCHANGER',
      categorias: ['ANTES', 'MPI', 'VERIFICAR', 'MPF'],
    },
    {
      nombre: 'SCOOPTRAM',
      categorias: ['ANTES', 'DESPUES', 'MPI'],
    },
    {
      nombre: 'DUMPER',
      categorias: ['ANTES', 'DESPUES', 'MPI'],
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<SeleccionProcesoEstatosDialogComponent>,
    private dialog: MatDialog, // 🟢 Inyectamos MatDialog aquí
  ) {}

  seleccionarProceso(proceso: any) {
    this.abrirDialogo(proceso);
  }

  abrirDialogo(proceso: any) {
    const dialogRef = this.dialog.open(OpcionesDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'opciones-proceso-dialog',
      data: {
        proceso: proceso.nombre,
        categorias: proceso.categorias,
      },
    });

    this.dialogRef.close();
  }
  cerrarDialogo() {
    this.dialogRef.close();
  }
}
