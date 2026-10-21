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
  labor: string; destino: string; tipo_labor: string; tipo_labor_id?: number | null;
  ducto: string; cable: string; tuberia: string; observaciones: string;
  [key: string]: any;
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
    if (changes['operacion'] || changes['visible']?.currentValue) {
      this.cargarDatosOperacion(this.operacion);
    }
  }

  public get mostrarCamposCompletos(): boolean {
    return this.estado === 'OPERATIVO';
  }

  // 🔥 CARGA DATOS DESDE OPERACIÓN (con nueva estructura origen/destino)
  cargarDatosOperacion(op: any) {
    const datos = this.normalizarOperacion(op);
    this.datosPerforacion = { ...this.getInitDatosPerforacion(), ...datos };
  }

  private normalizarOperacion(op: unknown): Record<string, unknown> {
    let valor: unknown = op;
    if (typeof valor === 'string') {
      try {
        valor = JSON.parse(valor);
      } catch {
        return {};
      }
    }
    return valor && typeof valor === 'object' ? valor as Record<string, unknown> : {};
  }

  private leerTexto(...valores: unknown[]): string {
    const valor = valores.find(item => item !== null && item !== undefined);
    return typeof valor === 'string' ? valor : String(valor ?? '');
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
      labor: '', destino: '', tipo_labor: '', ducto: '', cable: '', tuberia: '',
      observaciones: '',
    };
  }
}