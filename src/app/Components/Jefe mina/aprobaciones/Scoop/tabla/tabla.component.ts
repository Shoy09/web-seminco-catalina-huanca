// tabla.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormularioOperacionComponent } from "../formulario-operacion/formulario-operacion.component";
import { FormularioPerforacionComponent } from "../formulario-perforacion/formulario-perforacion.component";
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface Operacion {
  // 🔥 Nombres CON _inicio como viene de la BD
  nivel_inicio: string;
  tipo_labor_inicio: string;
  labor_inicio: string;
  ala_inicio: string;
  observaciones?: string;
  // 🔥 Campos específicos de PERFORACIÓN
  n_cucharas?: number;
  ubicacion_destino?: string;
  ubicacion_destino_id?: number;
}

interface Registro {
  nro: number;
  estado: string;
  codigo: string;
  horaInicio: string;
  horaFin: string;
  color: string;
  operacion: Operacion;
  indiceOriginal: number; // 🔥 Guardamos el índice original
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
  @Output() dataChange = new EventEmitter<any[]>(); // 🔥 EMITIR CAMBIOS

  @Input() turno: string = '';

  public datos: Registro[] = [];
  public mostrarOperacion = false;
  public mostrarPerforacion = false;
  public estadoSeleccionado = '';
  public horaInicioSeleccionado = '';
  public codigoSeleccionado = '';
  public operacionSeleccionada: Operacion | null = null;
  public operacionFormSeleccionada: any = null;
  public registroEnEdicion: Registro | null = null; // 🔥 Guardar qué registro editamos

   constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.mapearDatos();
      console.log('🔥 DATA TABLA SCOPPS:', this.data);
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
      nivel_inicio: '',
      tipo_labor_inicio: '',
      labor_inicio: '',
      ala_inicio: '',
      observaciones: '',
      n_cucharas: null,
      ubicacion_destino: '',
      ubicacion_destino_id: null
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
    console.log('Ejecutando:', item);
    this.registroEnEdicion = item; // 🔥 Guardar registro
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

  // 🔥 Manejar cambios desde formulario-operacion
  onConfirmarOperacion(datosActualizados: any) {
    if (this.registroEnEdicion) {
      // Actualizar el registro local
      this.registroEnEdicion.estado = datosActualizados.estado;
      this.registroEnEdicion.codigo = datosActualizados.codigo;
      this.registroEnEdicion.horaInicio = datosActualizados.horaInicio;
      this.registroEnEdicion.horaFin = datosActualizados.horaFin;
      // Actualizar el color según el nuevo estado
      this.registroEnEdicion.color = this.getColorEstado(datosActualizados.estado);
      
      // Emitir cambios al padre
      this.emitirCambios();
    }
    
    this.cerrarFormOperacion();
  }

  // 🔥 Manejar cambios desde formulario-perforacion (SOSTENIMIENTO)
  // 🔥 Manejar cambios desde formulario-perforacion
onGuardarPerforacion(datosPerforacion: any) {
  if (this.registroEnEdicion) {
    // ✅ Guardar con los nombres QUE ESPERA LA BD (_inicio)
    this.registroEnEdicion.operacion = {
      // Ubicación (con _inicio)
      nivel_inicio: datosPerforacion.ubicacion.nivel_inicio,
      tipo_labor_inicio: datosPerforacion.ubicacion.tipo_labor_inicio,
      labor_inicio: datosPerforacion.ubicacion.labor_inicio,
      ala_inicio: datosPerforacion.ubicacion.ala_inicio,
      
      // 🔥 CAMPOS DE PERFORACIÓN
      n_cucharas: datosPerforacion.n_cucharas,
      ubicacion_destino: datosPerforacion.ubicacion_destino,
      ubicacion_destino_id: datosPerforacion.ubicacion_destino_id,
      
      // Observaciones
      observaciones: datosPerforacion.observaciones
    };
    
    console.log('✅ Operación perforación actualizada:', this.registroEnEdicion.operacion);
    
    // Emitir cambios al padre
    this.emitirCambios();
  }
  
  this.cerrarFormPerforacion();
}

  // 🔥 Emitir el array completo actualizado
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