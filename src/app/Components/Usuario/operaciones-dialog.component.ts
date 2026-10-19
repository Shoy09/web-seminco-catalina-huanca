import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-operaciones-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  template: `
    <div class="user-dialog">
      <div class="dialog-heading"><span class="heading-icon"><i class="pi pi-shield" aria-hidden="true"></i></span><div><h2 mat-dialog-title>Operaciones permitidas</h2><p>Accesos autorizados para este usuario.</p></div><button type="button" class="icon-button" mat-dialog-close aria-label="Cerrar operaciones"><i class="pi pi-times" aria-hidden="true"></i></button></div>
      <mat-dialog-content class="dialog-body"><ul class="operations-list" style="list-style:none;padding:0;margin:0"><li class="operation-option" *ngFor="let operacion of data" style="cursor:default"><i class="pi pi-check" aria-hidden="true"></i>{{ operacion }}</li></ul><p class="muted" *ngIf="!data.length">Sin operaciones autorizadas.</p></mat-dialog-content>
      <div class="dialog-actions"><button type="button" class="ui-button primary" mat-dialog-close>Cerrar</button></div>
    </div>
  `,
  styleUrl: './usuario-ui.css',
})
export class OperacionesDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string[]) {}
}
