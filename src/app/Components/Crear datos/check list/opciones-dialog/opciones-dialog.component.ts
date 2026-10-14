
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CheckListFromComponent } from '../check-list-from/check-list-from.component';

@Component({
  selector: 'app-opciones-dialog',
  standalone: true,
  imports: [],
  templateUrl: './opciones-dialog.component.html',
  styleUrl: './opciones-dialog.component.css',
})
export class OpcionesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OpcionesDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { proceso: string; categorias: string[] },
  ) {}

  seleccionar(opcion: string): void {
    this.dialogRef.close();
    this.dialog.open(CheckListFromComponent, {
      width: '800px', maxWidth: 'calc(100vw - 24px)', maxHeight: '90dvh', autoFocus: 'dialog',
      data: { ...this.data, modo: opcion === 'excel' ? 'excel' : 'manual' },
    });
  }
}
