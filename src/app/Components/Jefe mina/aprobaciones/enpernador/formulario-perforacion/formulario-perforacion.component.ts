import { CommonModule } from '@angular/common';
import {
  Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// 🔥 INTERFACES NUEVAS
interface Perno {
  tipo_pernos: string;
  log_pernos: string;
  n_pernos_instalados: number | null;
  sistematico_puntual: string;
}

interface Malla {
  tipo_malla: string;
  mt52_malla: string;
}

interface Perforacion {
  n_taladros: number | null;
  longitud_perforacion: number | null;
  tipo_perforacion: string;
}

interface DatosPerforacion {
  labor: string;
  observaciones: string;
  perno: Perno[];
  malla: Malla[];
  perforacion: Perforacion[];
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

  // 🔥 LISTAS DE OPCIONES
  public tiposPerforacion: string[] = [
  'FRENTE',
  'REALCE',
  'SELLADA',
  'MANTENIMIENTO',
  'BREASTING',
  'DESQUINCHE',
  'INTERSECCIÓN',
  'REHABILITACIÓN',
  'NICHO',
  'SERVICIOS'
];

  public tiposPerno: string[] = [
  'Split Set',
  'Swellex',
  'Perno Helicoidal',
  'NICHO',
  'SERVICIOS'
];

  public tiposMalla: string[] = [
  'Malla m2 C-10',
  'Malla m2 C-8',
  'Malla m2 Eslabonada'
];

  public tiposSistematico: string[] = ['Puntual', 'Sistemático'];

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

  // 🔥 CARGA DATOS DESDE OPERACIÓN
  cargarDatosOperacion(op: any) {
    console.log('📥 Datos recibidos en operacion:', op);

    this.datosPerforacion.labor = op.labor || '';
    this.datosPerforacion.observaciones = op.observaciones || '';

    // 🔥 PERNO
    this.datosPerforacion.perno = Array.isArray(op.perno)
      ? op.perno.map((p: any) => ({
          tipo_pernos: p.tipo_pernos || '',
          log_pernos: p.log_pernos?.toString() || '',
          n_pernos_instalados: p.n_pernos_instalados ?? null,
          sistematico_puntual: p.sistematico_puntual || 'Puntual',
        }))
      : [];

    // 🔥 MALLA
    this.datosPerforacion.malla = Array.isArray(op.malla)
      ? op.malla.map((m: any) => ({
          tipo_malla: m.tipo_malla || '',
          mt52_malla: m.mt52_malla?.toString() || '',
        }))
      : [];

    // 🔥 PERFORACION
    this.datosPerforacion.perforacion = Array.isArray(op.perforacion)
      ? op.perforacion.map((p: any) => ({
          n_taladros: p.n_taladros ?? null,
          longitud_perforacion: p.longitud_perforacion ?? null,
          tipo_perforacion: p.tipo_perforacion || 'FRENTE',
        }))
      : [];

    // Si no hay filas, dejamos al menos una vacía para que se pueda editar
    if (this.datosPerforacion.perno.length === 0) this.agregarPerno();
    if (this.datosPerforacion.malla.length === 0) this.agregarMalla();
    if (this.datosPerforacion.perforacion.length === 0) this.agregarPerforacion();
  }

  // =============================
  // 🔥 PERNO
  // =============================
  agregarPerno() {
    this.datosPerforacion.perno.push({
      tipo_pernos: '',
      log_pernos: '',
      n_pernos_instalados: null,
      sistematico_puntual: 'Puntual',
    });
  }

  eliminarPerno(index: number) {
    if (this.datosPerforacion.perno.length > 1) {
      this.datosPerforacion.perno.splice(index, 1);
    }
  }

  // =============================
  // 🔥 MALLA
  // =============================
  agregarMalla() {
    this.datosPerforacion.malla.push({
      tipo_malla: '',
      mt52_malla: '',
    });
  }

  eliminarMalla(index: number) {
    if (this.datosPerforacion.malla.length > 1) {
      this.datosPerforacion.malla.splice(index, 1);
    }
  }

  // =============================
  // 🔥 PERFORACION
  // =============================
  agregarPerforacion() {
    this.datosPerforacion.perforacion.push({
      n_taladros: null,
      longitud_perforacion: null,
      tipo_perforacion: 'FRENTE',
    });
  }

  eliminarPerforacion(index: number) {
    if (this.datosPerforacion.perforacion.length > 1) {
      this.datosPerforacion.perforacion.splice(index, 1);
    }
  }

  // =============================
  // 🔥 ACCIONES
  // =============================
  cerrarFormPerforacion() {
    this.cerrar.emit();
  }

  guardarPerforacion() {
    if (this.validarFormulario()) {
      const datosAEmitir = {
        labor: this.datosPerforacion.labor,
        observaciones: this.datosPerforacion.observaciones,
        perno: this.datosPerforacion.perno.filter(
          (p) => p.tipo_pernos && p.tipo_pernos.trim() !== ''
        ),
        malla: this.datosPerforacion.malla.filter(
          (m) => m.tipo_malla && m.tipo_malla.trim() !== ''
        ),
        perforacion: this.datosPerforacion.perforacion.filter(
          (p) => p.longitud_perforacion !== null && p.longitud_perforacion > 0
        ),
      };

      console.log('📤 Emitiendo datos perforación:', datosAEmitir);
      this.guardar.emit(datosAEmitir);
      this.formularioInvalido = false;
      this.cerrar.emit();
    } else {
      this.formularioInvalido = true;
      console.warn('⚠️ Formulario inválido: faltan campos obligatorios');
    }
  }

  validarFormulario(): boolean {
    const tienePerforacionValida = this.datosPerforacion.perforacion.some(
      (p) => p.longitud_perforacion !== null && p.longitud_perforacion > 0
    );

    return !!(this.datosPerforacion.labor && tienePerforacionValida);
  }

  private getInitDatosPerforacion(): DatosPerforacion {
    return {
      labor: '',
      observaciones: '',
      perno: [
        {
          tipo_pernos: '',
          log_pernos: '',
          n_pernos_instalados: null,
          sistematico_puntual: 'Puntual',
        },
      ],
      malla: [{ tipo_malla: '', mt52_malla: '' }],
      perforacion: [
        { n_taladros: null, longitud_perforacion: null, tipo_perforacion: 'FRENTE' },
      ],
    };
  }
}