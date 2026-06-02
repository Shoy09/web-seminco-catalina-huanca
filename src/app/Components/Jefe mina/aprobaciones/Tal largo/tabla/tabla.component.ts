// tabla.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormularioOperacionComponent } from "../formulario-operacion/formulario-operacion.component";
import { FormularioPerforacionComponent } from "../formulario-perforacion/formulario-perforacion.component";
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

// 🔥 INTERFAZ ACTUALIZADA CON BARRAS COMO ARRAY
interface Barra {
  n_fila: number | null;
  n_taladro: number | null;
  longitud_perforacion: number | null;
  n_barras: number | null;
  tipo_perforacion: string;
}

interface Operacion {
  labor: string;
  observaciones: string;
  barras: Barra[];
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
  public registroEnEdicion: Registro | null = null;
  public operacionFormSeleccionada: any = null;

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.mapearDatos();
      console.log('🔥 DATA RECIBIDA:', this.data);
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
        labor: '',
        observaciones: '',
        barras: []
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

  // 🔥 ACTUALIZADO: Manejar datos de perforación con NUEVA ESTRUCTURA (barras como array)
  onGuardarPerforacion(datosPerforacion: any) {
    if (this.registroEnEdicion) {
      this.registroEnEdicion.operacion = {
        labor: datosPerforacion.labor,
        observaciones: datosPerforacion.observaciones,
        barras: datosPerforacion.barras || []
      };
      
      console.log('✅ Perforación guardada:', this.registroEnEdicion.operacion);
      this.emitirCambios();
    }
    this.cerrarFormPerforacion();
  }

  emitirCambios() {
    const dataActualizada = this.datos.map(registro => ({
      numero: registro.nro,
      estado: registro.estado,
      codigo: registro.codigo,
      hora_inicio: registro.horaInicio,
      hora_final: registro.horaFin,
      operacion: registro.operacion
    }));
    
    console.log('📤 EMITIENDO:', dataActualizada);
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