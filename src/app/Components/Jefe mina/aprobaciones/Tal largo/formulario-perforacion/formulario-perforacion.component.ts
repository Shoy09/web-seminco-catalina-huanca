import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// 🔥 INTERFAZ ACTUALIZADA - n_fila es editable
interface Barra {
  n_fila: number | null;
  n_taladro: number | null;
  longitud_perforacion: number | null;
  n_barras: number | null;
  tipo_perforacion: string;
}

interface DatosPerforacion {
  labor: string;
  observaciones: string;
  barras: Barra[];
}

@Component({
  selector: 'app-formulario-perforacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-perforacion.component.html',
  styleUrl: './formulario-perforacion.component.css',
})
export class FormularioPerforacionComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() operacion: any;
  @Input() estado: string = '';
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  public formularioInvalido = false;
  public datosPerforacion: DatosPerforacion = this.getInitDatosPerforacion();
  
  // Opciones para tipo de perforación
public tiposPerforacion: string[] = [
  'PRODUCCIÓN',
  'SLOT',
  'RIMADO',
  'REPASO',
  'ADICIONAL',
  'CORRECIÓN',
  'RECONOCIMIENTO'
];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['operacion'] && this.operacion) {
      this.cargarDatosOperacion(this.operacion);
    }
  }

  public get mostrarCamposCompletos(): boolean {
    return this.estado === 'OPERATIVO';
  }

  // 🔥 CARGA DATOS DESDE OPERACIÓN - SIN MODIFICAR, TAL CUAL VIENEN DE BD
  cargarDatosOperacion(op: any) {
    console.log('📥 Cargando operación:', op);
    
    // Labor
    this.datosPerforacion.labor = op.labor || '';
    
    // Observaciones
    this.datosPerforacion.observaciones = op.observaciones || '';
    
    // Barras - cargar EXACTAMENTE como vienen de la BD, sin modificar
    if (op.barras && Array.isArray(op.barras)) {
      this.datosPerforacion.barras = op.barras.map((barra: any) => ({
        n_fila: barra.n_fila !== undefined ? barra.n_fila : null,
        n_taladro: barra.n_taladro !== undefined ? barra.n_taladro : null,
        longitud_perforacion: barra.longitud_perforacion !== undefined ? barra.longitud_perforacion : null,
        n_barras: barra.n_barras !== undefined ? barra.n_barras : null,
        tipo_perforacion: barra.tipo_perforacion || 'PRODUCCIÓN'
      }));
    } else if (op.long_barras && op.num_barras) {
      // Compatibilidad con versión anterior
      this.convertirDatosAntiguos(op);
    }
  }

  // Convertir datos antiguos a nuevo formato
  convertirDatosAntiguos(op: any) {
    const numBarras = parseInt(op.num_barras) || 1;
    const longitud = parseFloat(op.long_barras) || 0;
    const tipoPerf = op.tipo_perforacion || 'PRODUCCIÓN';
    const numTaladro = op.n_taladro_produccion ? parseInt(op.n_taladro_produccion) : null;
    
    this.datosPerforacion.barras = [];
    for (let i = 1; i <= numBarras; i++) {
      this.datosPerforacion.barras.push({
        n_fila: i,
        n_taladro: numTaladro,
        longitud_perforacion: longitud,
        n_barras: numBarras,
        tipo_perforacion: tipoPerf
      });
    }
  }

  // 🔥 AGREGAR NUEVA FILA DE BARRA - Ahora sin auto-incrementar n_fila
  agregarBarra() {
    this.datosPerforacion.barras.push({
      n_fila: null,
      n_taladro: null,
      longitud_perforacion: null,
      n_barras: null,
      tipo_perforacion: 'PRODUCCIÓN'
    });
  }

  // 🔥 ELIMINAR FILA DE BARRA
  eliminarBarra(index: number) {
    if (this.datosPerforacion.barras.length > 1) {
      this.datosPerforacion.barras.splice(index, 1);
    }
  }

  cerrarFormPerforacion() {
    this.cerrar.emit();
  }

  // 🔥 EMITIR CON LA MISMA ESTRUCTURA, RESPETANDO LOS VALORES INGRESADOS
  guardarPerforacion() {
    if (this.validarFormulario()) {
      const datosAEmitir = {
        labor: this.datosPerforacion.labor,
        observaciones: this.datosPerforacion.observaciones,
        barras: this.datosPerforacion.barras.filter(barra => 
          barra.longitud_perforacion !== null && 
          barra.longitud_perforacion > 0
        )
      };
      
      console.log('📤 Emitiendo datos perforación:', datosAEmitir);
      this.guardar.emit(datosAEmitir);
      this.formularioInvalido = false;
    } else {
      this.formularioInvalido = true;
      console.warn('⚠️ Formulario inválido: faltan campos obligatorios');
    }
  }

  validarFormulario(): boolean {
    // Validar que haya al menos una barra con longitud válida
    const tieneBarraValida = this.datosPerforacion.barras.some(barra => 
      barra.longitud_perforacion !== null && 
      barra.longitud_perforacion > 0
    );
    
    return !!(
      this.datosPerforacion.labor && 
      tieneBarraValida
    );
  }

  private getInitDatosPerforacion(): DatosPerforacion {
    return {
      labor: '',
      observaciones: '',
      barras: [
        {
          n_fila: null,
          n_taladro: null,
          longitud_perforacion: null,
          n_barras: null,
          tipo_perforacion: 'PRODUCCIÓN'
        }
      ]
    };
  }
}