import { CommonModule } from '@angular/common';
import {
  Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// 🔥 INTERFAZ NUEVA
interface DatosScalamin {
  labor: string;
  tipo_labor_texto: string;
  area_m2: number | null;
  metros_lineales: number | null;
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
  public datosScalamin: DatosScalamin = this.getInitDatos();

  // 🔥 LISTA DE TIPOS DE LABOR
  public tiposLabor: string[] = [
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

    this.datosScalamin = {
      labor: op.labor || '',
      tipo_labor_texto: op.tipo_labor_texto || '',
      area_m2: op.area_m2 ?? null,
      metros_lineales: op.metros_lineales ?? null,
      observaciones: op.observaciones || '',
    };
  }

  // 🔥 ACCIONES
  cerrarFormPerforacion() {
    this.cerrar.emit();
  }

  guardarPerforacion() {
    if (this.validarFormulario()) {
      const datosAEmitir: DatosScalamin = {
        labor: this.datosScalamin.labor,
        tipo_labor_texto: this.datosScalamin.tipo_labor_texto,
        area_m2: this.datosScalamin.area_m2,
        metros_lineales: this.datosScalamin.metros_lineales,
        observaciones: this.datosScalamin.observaciones,
      };

      console.log('📤 Emitiendo datos scalamin:', datosAEmitir);
      this.guardar.emit(datosAEmitir);
      this.formularioInvalido = false;
      this.cerrar.emit();
    } else {
      this.formularioInvalido = true;
      console.warn('⚠️ Formulario inválido: faltan campos obligatorios');
    }
  }

  validarFormulario(): boolean {
    return !!(
      this.datosScalamin.labor &&
      this.datosScalamin.tipo_labor_texto
    );
  }

  private getInitDatos(): DatosScalamin {
    return {
      labor: '',
      tipo_labor_texto: '',
      area_m2: null,
      metros_lineales: null,
      observaciones: '',
    };
  }
}