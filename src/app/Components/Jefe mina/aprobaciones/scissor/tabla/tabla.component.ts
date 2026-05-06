// tabla.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormularioOperacionComponent } from "../formulario-operacion/formulario-operacion.component";
import { FormularioPerforacionComponent } from "../formulario-perforacion/formulario-perforacion.component";
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

// tabla.component.ts - NUEVA ESTRUCTURA
interface Operacion {
  // Origen
  origen_nivel: string;
  origen_tipo_labor: string;
  origen_labor: string;
  origen_ala: string;
  
  // Destino
  destino_nivel: string;
  destino_tipo_labor: string;
  destino_labor: string;
  destino_ala: string;
  
  // Observaciones
  observaciones: string;
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
      console.log('🔥 DATA RECIBIDA :', this.data);
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
        // Origen
        origen_nivel: '',
        origen_tipo_labor: '',
        origen_labor: '',
        origen_ala: '',
        // Destino
        destino_nivel: '',
        destino_tipo_labor: '',
        destino_labor: '',
        destino_ala: '',
        // Observaciones
        observaciones: ''
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

  // 🔥 ACTUALIZADO: Manejar datos de perforación con NUEVA estructura (origen/destino)
  onGuardarPerforacion(datosPerforacion: any) {
    if (this.registroEnEdicion) {
      this.registroEnEdicion.operacion = {
        // 📍 ORIGEN
        origen_nivel: datosPerforacion.origen.nivel,
        origen_tipo_labor: datosPerforacion.origen.tipoLabor,
        origen_labor: datosPerforacion.origen.labor,
        origen_ala: datosPerforacion.origen.ala,
        
        // 📍 DESTINO
        destino_nivel: datosPerforacion.destino.nivel,
        destino_tipo_labor: datosPerforacion.destino.tipoLabor,
        destino_labor: datosPerforacion.destino.labor,
        destino_ala: datosPerforacion.destino.ala,
        
        // 📝 Observaciones
        observaciones: datosPerforacion.observaciones
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
      operacion: registro.operacion  // ✅ Nueva estructura con origen/destino
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