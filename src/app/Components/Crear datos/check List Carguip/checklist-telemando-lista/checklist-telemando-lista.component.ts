import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ChecklistTelemando } from '../../../../models/checklist-telemando.model';
import { ChecklistTelemandoService } from '../../../../services/checklist-telemando.service';
import { ConfirmDialogComponent } from '../../../Estado/confirm-dialog/confirm-dialog.component';
import { ChecklistTelemandoFormDialogComponent } from '../checklist-telemando-form-dialog/checklist-telemando-form-dialog.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-checklist-telemando-lista',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './checklist-telemando-lista.component.html',
  styleUrl: './checklist-telemando-lista.component.css',
})
export class ChecklistTelemandoListaComponent implements OnInit {
  checklistsTelemando: ChecklistTelemando[] = [];

  constructor(
    private checklistService: ChecklistTelemandoService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.cargarChecklists();

    // Suscribirse a actualizaciones
    this.checklistService.getChecklistsActualizados().subscribe((cambio) => {
      if (cambio) {
        this.cargarChecklists(); // Recargar la tabla cuando haya cambios
      }
    });
  }

  cargarChecklists(): void {
    this.checklistService.getChecklists().subscribe(
      (data: ChecklistTelemando[]) => {
        this.checklistsTelemando = data;
      },
      (error: any) => {
        console.error('Error al obtener los checklists de telemando', error);
      },
    );
  }

  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(ChecklistTelemandoFormDialogComponent, {
      width: '450px',
      data: { modo: 'crear' },
      disableClose: true,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        // El servicio ya notificará el cambio mediante BehaviorSubject
        console.log('Checklist creado:', resultado);
      }
    });
  }

  abrirDialogoEditar(checklist: ChecklistTelemando): void {
    const dialogRef = this.dialog.open(ChecklistTelemandoFormDialogComponent, {
      width: '450px',
      data: {
        modo: 'editar',
        checklist: checklist,
      },
      disableClose: true,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        console.log('Checklist actualizado:', resultado);
      }
    });
  }

  eliminarItem(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        titulo: 'Confirmar eliminación',
        mensaje:
          '¿Estás seguro de que deseas eliminar este checklist de telemando?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.checklistService.deleteChecklist(id).subscribe({
          next: () => {
            console.log('Checklist eliminado correctamente');
            // El servicio ya notificará el cambio mediante BehaviorSubject
          },
          error: (error) => {
            console.error('Error al eliminar el checklist', error);
            // Aquí podrías mostrar un mensaje de error al usuario
          },
        });
      }
    });
  }

  // Método auxiliar para refrescar manualmente
  refrescarTabla(): void {
    this.cargarChecklists();
  }
}
