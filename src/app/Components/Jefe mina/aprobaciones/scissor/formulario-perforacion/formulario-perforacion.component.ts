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

// 🔥 NUEVA INTERFAZ CON ORIGEN/DESTINO
interface DatosPerforacion {
  origen: {
    nivel: string;
    tipoLabor: string;
    labor: string;
    ala: string;
  };
  destino: {
    nivel: string;
    tipoLabor: string;
    labor: string;
    ala: string;
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

  // 🔥 CARGA DATOS DESDE OPERACIÓN (con nueva estructura origen/destino)
  cargarDatosOperacion(op: any) {
    console.log('📥 Cargando operación:', op);

    // Origen
    this.datosPerforacion.origen.nivel = op.origen_nivel || '';
    this.datosPerforacion.origen.tipoLabor = op.origen_tipo_labor || '';
    this.datosPerforacion.origen.labor = op.origen_labor || '';
    this.datosPerforacion.origen.ala = op.origen_ala || '';

    // Destino
    this.datosPerforacion.destino.nivel = op.destino_nivel || '';
    this.datosPerforacion.destino.tipoLabor = op.destino_tipo_labor || '';
    this.datosPerforacion.destino.labor = op.destino_labor || '';
    this.datosPerforacion.destino.ala = op.destino_ala || '';

    // Observaciones
    this.datosPerforacion.observaciones = op.observaciones || '';

    // Agregar a listas dinámicas (origen)
    this.agregarSiNoExiste(this.niveles, op.origen_nivel);
    this.agregarSiNoExiste(this.tiposLabor, op.origen_tipo_labor);
    this.agregarSiNoExiste(this.labores, op.origen_labor);
    this.agregarSiNoExiste(this.alas, op.origen_ala);

    // Agregar a listas dinámicas (destino)
    this.agregarSiNoExiste(this.niveles, op.destino_nivel);
    this.agregarSiNoExiste(this.tiposLabor, op.destino_tipo_labor);
    this.agregarSiNoExiste(this.labores, op.destino_labor);
    this.agregarSiNoExiste(this.alas, op.destino_ala);
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

  // 🔥 EMITIR CON NUEVA ESTRUCTURA (origen/destino)
  guardarPerforacion() {
    if (this.validarFormulario()) {
      console.log(
        '📤 Emitiendo datos perforación (origen/destino):',
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
      origen: { nivel: '', tipoLabor: '', labor: '', ala: '' },
      destino: { nivel: '', tipoLabor: '', labor: '', ala: '' },
      observaciones: '',
    };
  }
}