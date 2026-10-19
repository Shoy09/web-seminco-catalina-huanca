import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../Estado/confirm-dialog/confirm-dialog.component';
import { FormCreateComponent } from '../form-create/form-create.component';
import { PdfViewerDialogComponent } from '../pdf-viewer-dialog/pdf-viewer-dialog.component';
import { CarpetaFormDialogComponent } from '../carpeta-form-dialog/carpeta-form-dialog.component';
import { Carpeta, Pdf } from '../../../models/pdf.model';
import { PdfService } from '../../../services/pdf.service';
import { CarpetaService } from '../../../services/carpeta-pdf.service';

@Component({
  selector: 'app-list-pdf',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './list-pdf.component.html',
  styleUrl: './list-pdf.component.css'
})
export class ListPdfComponent implements OnInit {
  // Columnas para la tabla de PDFs
  displayedColumns: string[] = ['nombre', 'url_pdf', 'acciones'];
  dataSource = new MatTableDataSource<Pdf>();
  
  // Variables para carpetas
  carpetas: Carpeta[] = [];
  carpetaSeleccionada: Carpeta | null = null;

  // Mapa de conteo de PDFs por carpeta (id → cantidad)
  pdfCountMap: Record<number, number | undefined> = {};
  
  // Estado de carga
  loading = false;
  cargandoPdfs = false;
  errorCarpetas = '';
  errorPdfs = '';
  filtroBusqueda = '';

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  constructor(
    private pdfService: PdfService, 
    private carpetaService: CarpetaService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarCarpetas();
    
    // Suscribirse a actualizaciones de PDFs
    this.pdfService.pdfsActualizados$.subscribe((actualizado) => {
      if (actualizado && this.carpetaSeleccionada) {
        this.cargarPdfsPorCarpeta(this.carpetaSeleccionada.id);
      }
    });
    
    // Suscribirse a actualizaciones de carpetas
    this.carpetaService.carpetasActualizados$.subscribe((actualizado) => {
      if (actualizado) {
        this.cargarCarpetas();
      }
    });
  }

  // Cargar todas las carpetas
  cargarCarpetas(): void {
    this.loading = true;
    this.errorCarpetas = '';
    this.carpetaService.getCarpetas().subscribe({
      next: (data: Carpeta[]) => {
        this.carpetas = data;
        this.loading = false;
        
        // Si hay carpetas y no hay una seleccionada, seleccionar la primera
        if (this.carpetas.length > 0 && !this.carpetaSeleccionada) {
          this.seleccionarCarpeta(this.carpetas[0]);
        }
      },
      error: (error) => {
        console.error('Error al obtener carpetas', error);
        this.loading = false;
        this.errorCarpetas = 'No se pudieron cargar las carpetas.';
      }
    });
  }

  // Seleccionar una carpeta y cargar sus PDFs
  seleccionarCarpeta(carpeta: Carpeta): void {
    this.carpetaSeleccionada = carpeta;
    this.limpiarFiltro();
    this.cargarPdfsPorCarpeta(carpeta.id);
  }

  // Cargar PDFs de una carpeta específica
  cargarPdfsPorCarpeta(carpetaId: number): void {
    this.cargandoPdfs = true;
    this.errorPdfs = '';
    this.dataSource.data = [];
    this.pdfService.getPdfsPorCarpeta(carpetaId).subscribe({
      next: (data: Pdf[]) => {
        if (this.carpetaSeleccionada?.id !== carpetaId) return;
        this.dataSource.data = data;
        // Actualizar el conteo en el mapa
        this.pdfCountMap[carpetaId] = data.length;
        this.cargandoPdfs = false;
        this.dataSource.paginator?.firstPage();
      },
      error: (error) => {
        if (this.carpetaSeleccionada?.id !== carpetaId) return;
        console.error('Error al obtener PDFs de la carpeta', error);
        this.cargandoPdfs = false;
        this.errorPdfs = 'No se pudieron cargar los documentos de esta carpeta.';
        this.dataSource.data = [];
      }
    });
  }

  // Aplicar filtro de búsqueda
  applyFilter(event: Event): void {
    this.filtroBusqueda = (event.target as HTMLInputElement).value;
    const filterValue = this.filtroBusqueda.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    this.dataSource.paginator?.firstPage();
  }

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.dataSource.filter = '';
    this.dataSource.paginator?.firstPage();
  }

  // Abrir diálogo para crear nueva carpeta
  abrirDialogoCrearCarpeta(): void {
    const dialogRef = this.dialog.open(CarpetaFormDialogComponent, {
      width: '400px',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarCarpetas();
      }
    });
  }

  // Abrir diálogo para crear nuevo PDF
  abrirDialogoCrearPdf(): void {
    if (!this.carpetaSeleccionada) {
      this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          mensaje: 'Por favor, selecciona una carpeta primero para crear un PDF.',
          soloConfirmar: true
        }
      });
      return;
    }

    const dialogRef = this.dialog.open(FormCreateComponent, {
      width: '450px',
      data: {
        carpetaId: this.carpetaSeleccionada.id,
        carpetaNombre: this.carpetaSeleccionada.nombre
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarPdfsPorCarpeta(this.carpetaSeleccionada!.id);
      }
    });
  }

  // Abrir diálogo para editar PDF
  abrirDialogoEditar(pdf: Pdf): void {
    const dialogRef = this.dialog.open(FormCreateComponent, {
      width: '450px',
      data: {
        carpetaId: this.carpetaSeleccionada?.id,
        carpetaNombre: this.carpetaSeleccionada?.nombre,
        pdf
      }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && this.carpetaSeleccionada) {
        this.cargarPdfsPorCarpeta(this.carpetaSeleccionada.id);
      }
    });
  }

  // Eliminar carpeta
  eliminarCarpeta(carpeta: Carpeta): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        mensaje: `¿Estás seguro de que deseas eliminar la carpeta "${carpeta.nombre}"? Se eliminarán todos los PDFs que contiene.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.carpetaService.deleteCarpeta(carpeta.id).subscribe({
          next: () => {
            // Si la carpeta eliminada era la seleccionada, limpiar selección
            if (this.carpetaSeleccionada?.id === carpeta.id) {
              this.carpetaSeleccionada = null;
              this.dataSource.data = [];
              this.cargandoPdfs = false;
              this.errorPdfs = '';
              this.limpiarFiltro();
            }
            this.cargarCarpetas();
          },
          error: (error) => console.error('Error al eliminar la carpeta', error)
        });
      }
    });
  }

  // Eliminar PDF
  eliminarPdf(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { mensaje: '¿Estás seguro de que deseas eliminar este PDF?' }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado && this.carpetaSeleccionada) {
        this.pdfService.deletePdf(id).subscribe({
          next: () => {
            this.cargarPdfsPorCarpeta(this.carpetaSeleccionada!.id);
          },
          error: (error) => console.error('Error al eliminar el PDF', error)
        });
      }
    });
  }

  // Ver PDF en diálogo
  verPdf(url: string): void {
    this.dialog.open(PdfViewerDialogComponent, {
      width: '90%',
      data: { url }
    });
  }
}
