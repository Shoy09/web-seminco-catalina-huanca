// tabla.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormularioOperacionComponent } from "../formulario-operacion/formulario-operacion.component";
import { FormularioPerforacionComponent } from "../formulario-perforacion/formulario-perforacion.component";
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

// tabla.component.ts - NUEVA ESTRUCTURA
interface Operacion {
  labor?: string; destino?: string; tipo_labor?: string; tipo_labor_id?: number | null;
  ducto?: string; cable?: string; tuberia?: string; observaciones?: string;
}

interface Registro {
  nro: number;
  estado: string;
  codigo: string;
  horaInicio: string;
  horaFin: string | null;
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
      horaFin: item.hora_final ?? null,
      color: this.getColorEstado(item.estado),
      indiceOriginal: index,
      operacion: structuredClone(item.operacion || {})
    }));
  }

  getColorEstado(estado: string): string {
    const e = estado?.toUpperCase();
    if (e === 'OPERATIVO') return '#008557';
    if (e === 'DEMORA') return '#99660F';
    if (e === 'MANTENIMIENTO') return '#BD3636';
    return '#64748B';
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
      this.registroEnEdicion.horaFin = datosActualizados.horaFin || null;
      this.registroEnEdicion.color = this.getColorEstado(datosActualizados.estado);
      this.emitirCambios();
    }
    this.cerrarFormOperacion();
  }

  // 🔥 ACTUALIZADO: Manejar datos de perforación con NUEVA estructura (origen/destino)
  onGuardarPerforacion(datosPerforacion: any) {
    if (this.registroEnEdicion) {
      this.registroEnEdicion.operacion = {
        ...this.registroEnEdicion.operacion,
        ...datosPerforacion
      };

      console.log('✅ Perforación guardada:', this.registroEnEdicion.operacion);
      this.emitirCambios();
    }
    this.cerrarFormPerforacion();
  }

  emitirCambios() {
    const dataActualizada = this.datos.map(registro => ({
      ...this.data[registro.indiceOriginal],
      numero: registro.nro,
      estado: registro.estado,
      codigo: registro.codigo,
      hora_inicio: registro.horaInicio,
      hora_final: registro.horaFin || null,
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