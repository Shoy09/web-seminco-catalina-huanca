import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { ChecklistTelemando } from '../../../../models/checklist-telemando.model';
import { ChecklistTelemandoService } from '../../../../services/checklist-telemando.service';
import { ConfirmDialogComponent } from '../../../Estado/confirm-dialog/confirm-dialog.component';
import { ChecklistTelemandoFormDialogComponent } from '../checklist-telemando-form-dialog/checklist-telemando-form-dialog.component';

@Component({
  selector: 'app-checklist-telemando-lista',
  imports: [CommonModule,
    ReactiveFormsModule, 
    MatTableModule, 
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './checklist-telemando-lista.component.html',
  styleUrl: './checklist-telemando-lista.component.css'
})
export class ChecklistTelemandoListaComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  dataSource = new MatTableDataSource<ChecklistTelemando>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private checklistService: ChecklistTelemandoService, 
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarChecklists();
    
    // Suscribirse a actualizaciones
    this.checklistService.getChecklistsActualizados().subscribe(cambio => {
      if (cambio) {
        this.cargarChecklists(); // Recargar la tabla cuando haya cambios
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  cargarChecklists(): void {
    this.checklistService.getChecklists().subscribe(
      (data: ChecklistTelemando[]) => {
        this.dataSource.data = data;
        
        // Actualizar paginador
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage(); // Regresar a la primera página
        }
      },
      (error: any) => {
        console.error('Error al obtener los checklists de telemando', error);
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    
    // Volver a la primera página cuando se filtra
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(ChecklistTelemandoFormDialogComponent, {
      width: '450px',
      data: { modo: 'crear' },
      disableClose: true,
      autoFocus: true
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
        checklist: checklist 
      },
      disableClose: true,
      autoFocus: true
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
        mensaje: '¿Estás seguro de que deseas eliminar este checklist de telemando?' 
      }
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
          }
        });
      }
    });
  }

  // Método auxiliar para refrescar manualmente
  refrescarTabla(): void {
    this.cargarChecklists();
  }
}