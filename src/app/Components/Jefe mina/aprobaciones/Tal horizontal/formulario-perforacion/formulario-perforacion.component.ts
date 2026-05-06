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

// 🔥 INTERFAZ SOLO CON LOS CAMPOS QUE REALMENTE EXISTEN
interface DatosPerforacion {
  ubicacion: {
    nivel: string;
    tipoLabor: string;
    labor: string;
    ala: string;
  };
  taladros: {
    produccion: string;
    rimados: string;
    alivio: string;
    repaso: string;
  };
  barras: {
    longitud: string;
    nBarra: string;
  };
  tipoPerforacion: string;
  observaciones: string;
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

  // Datos para selects
  public niveles: string[] = ['100', '200', '300', '400', '4100'];
  public tiposLabor: string[] = ['RAMPA', 'GALERIA', 'CX', 'CHIMENEA', 'SUB-NIVEL'];
  public labores: string[] = [];
  public alas: string[] = ['NORTE', 'SUR', 'ESTE', 'OESTE'];
  public tiposPerforacion: string[] = [
  'FRENTE COMPLETO',
  'SELLADA',
  'DESQUINCHE',
  'REFUGIO',
  'CIRCADO',
  'BREASTING',
  'SERVICIOS',
  'CUNETA',
  'RADIO DE GIRO'
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

  cargarDatosOperacion(op: any) {
    console.log('📥 Cargando operación:', op);

    // Ubicación
    this.datosPerforacion.ubicacion.nivel = op.nivel || '';
    this.datosPerforacion.ubicacion.tipoLabor = op.tipo_labor || '';
    this.datosPerforacion.ubicacion.labor = op.labor || '';
    this.datosPerforacion.ubicacion.ala = op.ala || '';

    // Taladros
    this.datosPerforacion.taladros.produccion = op.tal_prod || '';
    this.datosPerforacion.taladros.rimados = op.tal_rimados || '';
    this.datosPerforacion.taladros.alivio = op.tal_alivio || '';
    this.datosPerforacion.taladros.repaso = op.tal_repaso || '';

    // Barras
    this.datosPerforacion.barras.longitud = op.long_barras || '';
    this.datosPerforacion.barras.nBarra = op.num_barras || '';

    // Tipo perforación
    this.datosPerforacion.tipoPerforacion = op.tipo_perforacion || '';

    // Observaciones
    this.datosPerforacion.observaciones = op.observaciones || '';

    // Agregar a listas dinámicas
    this.agregarSiNoExiste(this.niveles, op.nivel);
    this.agregarSiNoExiste(this.tiposLabor, op.tipo_labor);
    this.agregarSiNoExiste(this.labores, op.labor);
    this.agregarSiNoExiste(this.alas, op.ala);
    this.agregarSiNoExiste(this.tiposPerforacion, op.tipo_perforacion);
  }

  agregarSiNoExiste(lista: string[], valor: string) {
    if (!valor) return;
    const limpio = valor.trim();
    if (limpio && !lista.includes(limpio)) {
      lista.push(limpio);
    }
  }

  cerrarFormPerforacion() {
    this.cerrar.emit();
  }

  guardarPerforacion() {
    if (this.validarFormulario()) {
      console.log('📤 Emitiendo datos perforación:', this.datosPerforacion);
      this.guardar.emit(this.datosPerforacion);
      this.formularioInvalido = false;
    } else {
      this.formularioInvalido = true;
      console.warn('⚠️ Formulario inválido: faltan campos obligatorios');
    }
  }

  validarFormulario(): boolean {
    return !!(
      this.datosPerforacion.ubicacion.nivel &&
      this.datosPerforacion.ubicacion.tipoLabor &&
      this.datosPerforacion.ubicacion.labor
    );
  }

  private getInitDatosPerforacion(): DatosPerforacion {
    return {
      ubicacion: { nivel: '', tipoLabor: '', labor: '', ala: '' },
      taladros: { produccion: '', rimados: '', alivio: '', repaso: '' },
      barras: { longitud: '', nBarra: '' },
      tipoPerforacion: '',
      observaciones: '',
    };
  }
}