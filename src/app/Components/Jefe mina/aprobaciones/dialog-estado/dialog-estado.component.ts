import { Component } from '@angular/core';
import { MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-estado',
  imports: [MatDialogContent, MatDialogModule, MatButtonModule, MatRadioModule, FormsModule],
  templateUrl: './dialog-estado.component.html',
  styleUrls: ['../aprobacion-dialog.css', './dialog-estado.component.css']
})
export class DialogEstadoComponent {

  estado: number | null = null; // 1 = aprobado, 2 = rechazado

  constructor(private dialogRef: MatDialogRef<DialogEstadoComponent>) {}

  confirmar() {
    if (this.estado !== 1 && this.estado !== 2) return;
    this.dialogRef.close(this.estado);
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
