import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EstadoFormComponent } from '../estado-form/estado-form.component';
import * as XLSX from 'xlsx';
import { Estado2 } from '../../../models/Estado';
import { EstadoService } from '../../../services/estado.service';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-opciones-dialog',
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './opciones-dialog.component.html', 
  styleUrl: './opciones-dialog.component.css'
}) 
export class OpcionesDialogComponent {
  constructor(
    private estadoService: EstadoService,
    public dialogRef: MatDialogRef<OpcionesDialogComponent>,
    private dialog: MatDialog, // 🟢 Inyectamos MatDialog para abrir otro diálogo
    @Inject(MAT_DIALOG_DATA) public data: { proceso: string } // 🟢 Recibimos el estado
  ) {
    
  }

  seleccionar(opcion: string) {
    if (opcion === 'estado') {
      this.dialogRef.close();
      this.dialog.open(EstadoFormComponent, {
        width: '400px',
        data: { proceso: this.data.proceso }
      });
    } else if (opcion === 'excel') {
      this.abrirExploradorArchivos();
    } else {
      this.dialogRef.close(opcion);
    }
  }

  abrirExploradorArchivos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xls, .xlsx';
    input.style.display = 'none';

    input.addEventListener('change', async (event: any) => {
      const archivo = event.target.files[0];
      if (archivo) {
        
        this.procesarArchivoExcel(archivo);
        this.dialogRef.close(); // 🔴 Cerramos el diálogo después de seleccionar el archivo
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  async procesarArchivoExcel(archivo: File) {
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = 'ESTADOS';
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        console.error(`No se encontró la hoja llamada "${sheetName}"`);
        return;
      }

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Omitimos la primera fila (encabezados) y procesamos las siguientes
      const estados: Estado2[] = jsonData
  .slice(1)
  .filter((fila) => {
    // Verifica que al menos una celda tenga contenido real
    return fila && fila.some((celda: any) => celda !== null && celda !== undefined && celda !== '');
  })
  .map((fila) => ({
    estado_principal: fila[0] || '',
    codigo: fila[1] || '',
    tipo_estado: fila[2] || '',
    categoria: fila[3] || '',
    proceso: this.data.proceso
  }));

      if (estados.length === 0) {
        console.warn('No hay estados para procesar.');
        return;
      }

      this.mostrarPantallaCarga();
      await this.enviarEstadosALaBD(estados);
      this.cerrarPantallaCarga();
    };

    reader.readAsArrayBuffer(archivo);
  }

  async enviarEstadosALaBD(estados: Estado2[]) {
    let estadosInsertados = 0;

    for (const estado of estados) {
      try {
        await this.estadoService.createEstado2(estado).toPromise();
        
        estadosInsertados++;
      } catch (error) {
        console.error('Error al insertar estado:', estado.estado_principal, error);
      }
    }
  }

  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }

  cerrarPantallaCarga() {
    this.dialog.closeAll();
  }
}