// tabla.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormularioOperacionComponent } from "../formulario-operacion/formulario-operacion.component";
import { FormularioPerforacionComponent } from "../formulario-perforacion/formulario-perforacion.component";
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface Operacion {
  nivel: string;
  tipo_labor: string;
  labor: string;
  ala: string;
  observaciones?: string;
  // 🔥 Campos específicos de sostenimiento
  tipo_pernos?: string;
  log_pernos?: string;
  n_pernos_instalados?: string;
  tipo_malla?: string;
  mt52_malla?: string;
  sistematico_puntual?: string;
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
      console.log('🔥 DATA TABLA SOSTENIMIENTO:', this.data);
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
      indiceOriginal: index, // 🔥 Guardar índice
      operacion: item.operacion || {
        nivel: '',
        tipo_labor: '',
        labor: '',
        ala: '',
        observaciones: '',
        // 🔥 Campos sostenimiento
        tipo_pernos: '',
        log_pernos: '',
        n_pernos_instalados: '',
        tipo_malla: '',
        mt52_malla: '',
        sistematico_puntual: ''
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
  onGuardarPerforacion(datosPerforacion: any) {
    if (this.registroEnEdicion) {
      // ✅ Guardar los campos específicos de sostenimiento
      this.registroEnEdicion.operacion = {
        // Ubicación
        nivel: datosPerforacion.ubicacion.nivel,
        tipo_labor: datosPerforacion.ubicacion.tipoLabor,
        labor: datosPerforacion.ubicacion.labor,
        ala: datosPerforacion.ubicacion.ala,
        
        // 🔥 Pernos (sostenimiento)
        tipo_pernos: datosPerforacion.pernos.tipo,
        log_pernos: datosPerforacion.pernos.log,
        n_pernos_instalados: datosPerforacion.pernos.nInstalados,
        
        // 🔥 Malla (sostenimiento)
        tipo_malla: datosPerforacion.malla.tipo,
        mt52_malla: datosPerforacion.malla.mts2,
        sistematico_puntual: datosPerforacion.malla.sistematicoPuntual,
        
        // Observaciones
        observaciones: datosPerforacion.observaciones
      };
      
      console.log('✅ Operación sostenimiento actualizada:', this.registroEnEdicion.operacion);
      
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