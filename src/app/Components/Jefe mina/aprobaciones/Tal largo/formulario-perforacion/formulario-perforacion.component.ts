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

// 🔥 INTERFAZ CON ESTRUCTURA ANIDADA (como la versión que funciona)
interface DatosPerforacion {
  ubicacion: {
    nivel: string;
    tipoLabor: string;
    labor: string;
    ala: string;
  };
  metrosPerforados: {
    produccion: string;
    rimados: string;
    alivio: string;
    repaso: string;
  };
  numeroTaladros: {
    produccion: string;
    rimados: string;
    alivio: string;
    repaso: string;
  };
  barras: {
    longitud: string;
    numero: string;
  };
  tipoPerforacion: {
    id: number | null;
    nombre: string;
  };
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
  public niveles: string[] = ['100', '200', '300', '400'];
  public tiposLabor: string[] = ['RAMPA', 'GALERIA', 'CHIMENEA', 'SUB-NIVEL'];
  public labores: string[] = [];
  public alas: string[] = ['NORTE', 'SUR', 'ESTE', 'OESTE'];
  public tiposPerforacion: any[] = [
    { id: 1, nombre: 'PRODUCCIÓN' },
    { id: 2, nombre: 'DESARROLLO' },
    { id: 3, nombre: 'SOSTENIMIENTO' },
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

  // 🔥 CARGA DATOS DESDE OPERACIÓN (mapeo de plano a anidado)
  cargarDatosOperacion(op: any) {
    console.log('📥 Cargando operación:', op);

    // Ubicación
    this.datosPerforacion.ubicacion.nivel = op.nivel || '';
    this.datosPerforacion.ubicacion.tipoLabor = op.tipo_labor || '';
    this.datosPerforacion.ubicacion.labor = op.labor || '';
    this.datosPerforacion.ubicacion.ala = op.ala || '';

    // Metros perforados
    this.datosPerforacion.metrosPerforados.produccion =
      op.metros_perforados_produccion || '';
    this.datosPerforacion.metrosPerforados.rimados =
      op.metros_perforados_rimados || '';
    this.datosPerforacion.metrosPerforados.alivio =
      op.metros_perforados_alivio || '';
    this.datosPerforacion.metrosPerforados.repaso =
      op.metros_perforados_repaso || '';

    // Número de taladros
    this.datosPerforacion.numeroTaladros.produccion =
      op.n_taladros_produccion || '';
    this.datosPerforacion.numeroTaladros.rimados = op.n_taladros_rimados || '';
    this.datosPerforacion.numeroTaladros.alivio = op.n_taladros_alivio || '';
    this.datosPerforacion.numeroTaladros.repaso = op.n_taladros_repaso || '';

    // Barras
    this.datosPerforacion.barras.longitud = op.long_barras || '';
    this.datosPerforacion.barras.numero = op.num_barras || '';

    // Tipo perforación
    this.datosPerforacion.tipoPerforacion.id = op.tipo_perforacion_id || null;
    this.datosPerforacion.tipoPerforacion.nombre = op.tipo_perforacion || '';

    // Observaciones
    this.datosPerforacion.observaciones = op.observaciones || '';

    // Agregar a listas dinámicas
    this.agregarSiNoExiste(this.niveles, op.nivel);
    this.agregarSiNoExiste(this.tiposLabor, op.tipo_labor);
    this.agregarSiNoExiste(this.labores, op.labor);
    this.agregarSiNoExiste(this.alas, op.ala);

    // Agregar tipo perforación si es nuevo
    if (
      op.tipo_perforacion &&
      !this.tiposPerforacion.find((t) => t.nombre === op.tipo_perforacion)
    ) {
      this.tiposPerforacion.push({
        id: op.tipo_perforacion_id,
        nombre: op.tipo_perforacion,
      });
    }
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

  // 🔥 EMITIR CON ESTRUCTURA ANIDADA (como espera la tabla)
  guardarPerforacion() {
    if (this.validarFormulario()) {
      console.log(
        '📤 Emitiendo datos perforación (anidado):',
        this.datosPerforacion,
      );
      this.guardar.emit(this.datosPerforacion);
      this.formularioInvalido = false;
    } else {
      this.formularioInvalido = true;
      console.warn('⚠️ Formulario inválido: faltan campos obligatorios');
    }
  }

  validarFormulario(): boolean {
    // Validar campos obligatorios
    // return !!(
    //   this.datosPerforacion.ubicacion.nivel &&
    //   this.datosPerforacion.ubicacion.tipoLabor &&
    //   this.datosPerforacion.ubicacion.labor &&
    //   this.datosPerforacion.tipoPerforacion.nombre
    // );
    return true;
  }

  private getInitDatosPerforacion(): DatosPerforacion {
    return {
      ubicacion: { nivel: '', tipoLabor: '', labor: '', ala: '' },
      metrosPerforados: { produccion: '', rimados: '', alivio: '', repaso: '' },
      numeroTaladros: { produccion: '', rimados: '', alivio: '', repaso: '' },
      barras: { longitud: '', numero: '' },
      tipoPerforacion: { id: null, nombre: '' },
      observaciones: '',
    };
  }
}
