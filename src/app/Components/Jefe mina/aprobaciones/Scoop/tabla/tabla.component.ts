// tabla.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormularioOperacionComponent } from "../formulario-operacion/formulario-operacion.component";
import { FormularioPerforacionComponent } from "../formulario-perforacion/formulario-perforacion.component";
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface Operacion {
  // 🔥 Solo labor_inicio (los demás campos ya no existen)
  labor_inicio: string;
  observaciones?: string;
  
  // 🔥 Campos específicos de PERFORACIÓN
  n_cucharas?: number;
  ubicacion_destino?: string;
  ubicacion_destino_id?: number;
  
  // 🔥 NUEVOS CAMPOS
  material?: string;
  mineral?: string;
  desmonte?: string;
  relave?: string;
  relleno?: string;
  numero_volquete?: string;
}

interface Registro {
  nro: number;
  estado: string;
  codigo: string;
  horaInicio: string;
  horaFin: string;
  color: string;
  operacion: Operacion;
  indiceOriginal: number;
}

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, FormularioOperacionComponent, FormularioPerforacionComponent],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements OnChanges {

  @Input() data: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();

  @Input() turno: string = '';

  public datos: Registro[] = [];
  public mostrarOperacion = false;
  public mostrarPerforacion = false;
  public estadoSeleccionado = '';
  public horaInicioSeleccionado = '';
  public codigoSeleccionado = '';
  public operacionSeleccionada: Operacion | null = null;
  public operacionFormSeleccionada: any = null;
  public registroEnEdicion: Registro | null = null;

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.mapearDatos();
      console.log('🔥 DATA TABLA ACTUALIZADA:', this.data);
    }
  }

  mapearDatos() {
    this.datos = this.data.map((item: any, index: number) => ({
      nro: item.numero,
      estado: item.estado,
      codigo: item.codigo,
      horaInicio: item.hora_inicio,
      horaFin: item.hora_final || '--:--',
      color: this.getColorEstado(item.estado),
      indiceOriginal: index,
      operacion: item.operacion || {
        labor_inicio: '',
        observaciones: '',
        n_cucharas: null,
        ubicacion_destino: '',
        ubicacion_destino_id: null,
        material: '',
        mineral: '0',
        desmonte: '0',
        relave: '0',
        relleno: '0',
        numero_volquete: ''
      }
    }));
  }

  getColorEstado(estado: string): string {
    const e = estado?.toUpperCase();
    if (e === 'OPERATIVO') return '#28a745';
    if (e === 'DEMORA') return '#ffc107';
    if (e === 'MANTENIMIENTO') return '#dc3545';
    return '#6c757d';
  }

  onEdit(item: Registro) {
    this.registroEnEdicion = item;
    this.operacionFormSeleccionada = {
      estado: item.estado,
      codigo: item.codigo,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin
    };
    this.mostrarOperacion = true;
  }

  onExecute(item: Registro) {
    console.log('Ejecutando perforación:', item);
    this.registroEnEdicion = item;
    this.operacionSeleccionada = item.operacion;
    this.mostrarPerforacion = true;
  }

  onDelete(item: Registro) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.datos = this.datos.filter(r => r !== item);
      this.emitirCambios();
    });
  }

  onConfirmarOperacion(datosActualizados: any) {
    if (this.registroEnEdicion) {
      this.registroEnEdicion.estado = datosActualizados.estado;
      this.registroEnEdicion.codigo = datosActualizados.codigo;
      this.registroEnEdicion.horaInicio = datosActualizados.horaInicio;
      this.registroEnEdicion.horaFin = datosActualizados.horaFin;
      this.registroEnEdicion.color = this.getColorEstado(datosActualizados.estado);
      
      this.emitirCambios();
    }
    this.cerrarFormOperacion();
  }

  // 🔥 NUEVA VERSIÓN - Manejar datos de perforación actualizados
  onGuardarPerforacion(datosPerforacion: any) {
    if (this.registroEnEdicion) {
      // Actualizar la operación con los nuevos campos
      this.registroEnEdicion.operacion = {
        labor_inicio: datosPerforacion.labor_inicio,
        n_cucharas: datosPerforacion.n_cucharas,
        ubicacion_destino: datosPerforacion.ubicacion_destino,
        ubicacion_destino_id: datosPerforacion.ubicacion_destino_id,
        material: datosPerforacion.material,
        mineral: datosPerforacion.mineral,
        desmonte: datosPerforacion.desmonte,
        relave: datosPerforacion.relave,
        relleno: datosPerforacion.relleno,
        numero_volquete: datosPerforacion.numero_volquete,
        observaciones: datosPerforacion.observaciones
      };
      
      console.log('✅ Datos de perforación actualizados:', this.registroEnEdicion.operacion);
      
      // Emitir cambios al padre
      this.emitirCambios();
    }
    this.cerrarFormPerforacion();
  }

  emitirCambios() {
    // Reconstruir el array en el formato original
    const dataActualizada = this.datos.map(registro => ({
      numero: registro.nro,
      estado: registro.estado,
      codigo: registro.codigo,
      hora_inicio: registro.horaInicio,
      hora_final: registro.horaFin,
      operacion: registro.operacion
    }));
    
    this.dataChange.emit(dataActualizada);
  }

  cerrarFormOperacion() {
    this.mostrarOperacion = false;
    this.registroEnEdicion = null;
  }

  cerrarFormPerforacion() {
    this.mostrarPerforacion = false;
    this.registroEnEdicion = null;
  }
}