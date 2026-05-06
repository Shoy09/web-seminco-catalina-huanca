// tabla.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormularioOperacionComponent } from "../formulario-operacion/formulario-operacion.component";
import { FormularioPerforacionComponent } from "../formulario-perforacion/formulario-perforacion.component";
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

// tabla.component.ts
interface Operacion {
  // Ubicación
  nivel: string;
  tipo_labor: string;
  labor: string;
  ala: string;
  
  // 🔥 NUEVOS: Metros perforados (no más "tal_xxx")
  metros_perforados_produccion: string;
  metros_perforados_rimados: string;
  metros_perforados_alivio: string;
  metros_perforados_repaso: string;
  
  // 🔥 NUEVOS: Número de taladros
  n_taladros_produccion: string;
  n_taladros_rimados: string;
  n_taladros_alivio: string;
  n_taladros_repaso: string;
  
  // Barras
  long_barras: string;
  num_barras: string;
  
  // Perforación
  tipo_perforacion: string;
  tipo_perforacion_id: number | null;
  
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
        // Ubicación
        nivel: '',
        tipo_labor: '',
        labor: '',
        ala: '',
        // Metros perforados
        metros_perforados_produccion: '',
        metros_perforados_rimados: '',
        metros_perforados_alivio: '',
        metros_perforados_repaso: '',
        // Número de taladros
        n_taladros_produccion: '',
        n_taladros_rimados: '',
        n_taladros_alivio: '',
        n_taladros_repaso: '',
        // Barras
        long_barras: '',
        num_barras: '',
        // Perforación
        tipo_perforacion: '',
        tipo_perforacion_id: null,
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

  // 🔥 ACTUALIZADO: Manejar datos de perforación con nueva estructura
  onGuardarPerforacion(datosPerforacion: any) {
    if (this.registroEnEdicion) {
      this.registroEnEdicion.operacion = {
        ...this.registroEnEdicion.operacion,
        
        // 📍 Ubicación
        nivel: datosPerforacion.ubicacion.nivel,
        tipo_labor: datosPerforacion.ubicacion.tipoLabor,
        labor: datosPerforacion.ubicacion.labor,
        ala: datosPerforacion.ubicacion.ala,
        
        // 🔥 METROS PERFORADOS (nuevos campos)
        metros_perforados_produccion: datosPerforacion.metrosPerforados.produccion,
        metros_perforados_rimados: datosPerforacion.metrosPerforados.rimados,
        metros_perforados_alivio: datosPerforacion.metrosPerforados.alivio,
        metros_perforados_repaso: datosPerforacion.metrosPerforados.repaso,
        
        // 🔥 NÚMERO DE TALADROS (nuevos campos)
        n_taladros_produccion: datosPerforacion.numeroTaladros.produccion,
        n_taladros_rimados: datosPerforacion.numeroTaladros.rimados,
        n_taladros_alivio: datosPerforacion.numeroTaladros.alivio,
        n_taladros_repaso: datosPerforacion.numeroTaladros.repaso,
        
        // 🔥 BARRAS
        long_barras: datosPerforacion.barras.longitud,
        num_barras: datosPerforacion.barras.numero,
        
        // 🔥 TIPO PERFORACIÓN
        tipo_perforacion: datosPerforacion.tipoPerforacion.nombre,
        tipo_perforacion_id: datosPerforacion.tipoPerforacion.id,
        
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
      operacion: registro.operacion  // ✅ Incluye todos los nuevos campos
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