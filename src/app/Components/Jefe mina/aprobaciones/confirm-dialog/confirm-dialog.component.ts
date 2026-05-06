import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule,
    MatDialogTitle,      // ✅ Importante para mat-dialog-title
    MatDialogContent,    // ✅ Para mat-dialog-content
    MatDialogActions,    // ✅ Para mat-dialog-actions
    MatButtonModule,     // ✅ Para botones
    MatIconModule  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  cancelar() {
    this.dialogRef.close(false);
  }

  confirmar() {
    this.dialogRef.close(true);
  }
}