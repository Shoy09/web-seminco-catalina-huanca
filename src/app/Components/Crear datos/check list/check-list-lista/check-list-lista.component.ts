import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { SeleccionProcesoDialogComponent } from '../seleccion-proceso-dialog/seleccion-proceso-dialog.component';
import { CheckListItem } from '../../../../models/checklist-item.model';
import { CheckListItemService } from '../../../../services/checklist-item.service';
import { ConfirmDialogComponent } from '../../../Estado/confirm-dialog/confirm-dialog.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-check-list-lista',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    TableModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './check-list-lista.component.html',
  styleUrl: './check-list-lista.component.css',
})
export class CheckListListaComponent implements OnInit {
  checklistItems: CheckListItem[] = [];

  constructor(
    private checkService: CheckListItemService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getChecklistItems();
    this.checkService.getItemsActualizados().subscribe((cambio) => {
      if (cambio) {
        this.getChecklistItems(); // Recargar la tabla cuando haya cambios
      }
    });
  }

  getChecklistItems(): void {
    this.checkService.getCheckListItems().subscribe(
      (data: CheckListItem[]) => {
        this.checklistItems = data;
      },
      (error: any) => {
        console.error('Error al obtener los estados', error);
      },
    );
  }

  abrirDialogoEditar(estado: CheckListItem) {
    // const dialogRef = this.dialog.open(EstadoFormEditarComponent, {
    //   width: '700px',
    //   data: estado, // Pasamos el estado seleccionado
    //   autoFocus: false
    // });
    // dialogRef.afterClosed().subscribe((estadoEditado) => {
    //   if (estadoEditado) {
    //     this.getEstados(); // Volver a cargar los estados si hubo cambios
    //   }
    // });
  }

  eliminarItem(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar?' },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.checkService.deleteCheckListItem(id).subscribe(
          () => {
            this.getChecklistItems(); // Refrescar la lista después de eliminar
          },
          (error) => {
            console.error('Error al eliminar el estado', error);
          },
        );
      }
    });
  }

  abrirSeleccionProcesoDialogo() {
    const dialogRef = this.dialog.open(SeleccionProcesoDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((procesoSeleccionado) => {
      if (procesoSeleccionado) {
      }
    });
  }

  // abrirDialogoOpciones() {
  //   const dialogRef = this.dialog.open(OpcionesDialogComponent, {
  //     width: '400px'
  //   });

  //   dialogRef.afterClosed().subscribe((opcion) => {
  //     if (opcion === 'estado') {
  //       this.abrirDialogo();
  //     } else if (opcion === 'excel') {
  //       this.abrirExploradorArchivos();
  //     }
  //   });
  // }
}
