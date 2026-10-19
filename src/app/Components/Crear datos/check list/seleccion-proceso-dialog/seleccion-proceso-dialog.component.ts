import { MatDialogTitle } from '@angular/material/dialog';

import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckListItem } from '../../../../models/checklist-item.model';
import { CheckListItemService } from '../../../../services/checklist-item.service';
import { normalizarChecklist, PROCESOS_CHECKLIST, reutilizarValorChecklist, sugerenciasChecklist } from '../checklist-utils';
import { OpcionesDialogComponent } from '../opciones-dialog/opciones-dialog.component';

@Component({
  selector: 'app-seleccion-proceso-dialog',
  imports: [MatDialogTitle,FormsModule],
  templateUrl: './seleccion-proceso-dialog.component.html',
  styleUrl: './seleccion-proceso-dialog.component.css',
})
export class SeleccionProcesoDialogComponent implements OnInit {
  items: CheckListItem[] = [];
  proceso = '';
  error = '';
  private destroyRef = inject(DestroyRef);

  constructor(
    public dialogRef: MatDialogRef<SeleccionProcesoDialogComponent>,
    private dialog: MatDialog,
    private checklistService: CheckListItemService,
  ) {}

  readonly procesos = PROCESOS_CHECKLIST;

  ngOnInit(): void {
    this.checklistService.getCheckListItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => { this.items = items; },
      error: () => { this.error = 'No se pudieron cargar las categorías existentes. Podrás escribir una categoría en el formulario.'; },
    });
  }

  continuar(): void {
    const proceso = reutilizarValorChecklist(this.proceso, this.procesos);
    if (!this.procesos.includes(proceso)) return;
    this.dialog.open(OpcionesDialogComponent, {
      width: '560px', maxWidth: 'calc(100vw - 24px)', maxHeight: '90dvh',
      data: {
        proceso,
        categorias: sugerenciasChecklist(this.items.filter(item => normalizarChecklist(item.proceso) === normalizarChecklist(proceso)).map(item => item.categoria)),
      },
    });
    this.dialogRef.close();
  }

  cerrarDialogo(): void { this.dialogRef.close(); }
}
