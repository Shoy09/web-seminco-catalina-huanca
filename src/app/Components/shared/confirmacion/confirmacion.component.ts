import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [MatDialogModule, A11yModule],
  template: `
    <div class="confirmacion">
      <span class="confirmacion-icon pi pi-question-circle" aria-hidden="true"></span>
      <h2 mat-dialog-title>Confirmar acción</h2>
      <mat-dialog-content>{{ mensaje }}</mat-dialog-content>
      <mat-dialog-actions align="end">
        <button type="button" class="cancelar" [mat-dialog-close]="false" cdkFocusInitial>Cancelar</button>
        <button type="button" class="confirmar" [mat-dialog-close]="true">Confirmar</button>
      </mat-dialog-actions>
    </div>`,
  styles: [`
    .confirmacion { padding: 24px; background: #fff; border-top: 4px solid #38BDF8; }
    .confirmacion-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: #EAF8FE; color: #1D73A8; font-size: 24px; margin-bottom: 14px; }
    h2[mat-dialog-title] { padding: 0; margin: 0 0 12px; color: #0B1F3A; font-size: 18px; font-weight: 700; }
    h2[mat-dialog-title]::before { display: none; }
    mat-dialog-content { padding: 0; color: #526477; font-size: 14px; line-height: 1.6; }
    mat-dialog-actions { gap: 10px; padding: 24px 0 0; min-height: 0; }
    button { border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .cancelar { background: #fff; color: #344963; border: 1px solid #DCE4EA; }
    .cancelar:hover { background: #F5F8FA; }
    .confirmar { background: #0B1F3A; color: #fff; border: 1px solid #0B1F3A; }
    .confirmar:hover { background: #344963; }
    button:focus-visible { outline: 2px solid #38BDF8; outline-offset: 3px; }
  `],
})
export class ConfirmacionComponent {
  readonly mensaje = inject<string>(MAT_DIALOG_DATA);
}
