// formulario-perforacion.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

// 🔥 NUEVA INTERFAZ SIMPLIFICADA
interface DatosPerforacion {
  ubicacion: { 
    nivel_inicio: string; 
    tipo_labor_inicio: string; 
    labor_inicio: string; 
    ala_inicio: string; 
  };
  n_cucharas: number | null;
  ubicacion_destino: string;
  ubicacion_destino_id: number | null;
  observaciones: string;
}

@Component({
  selector: 'app-formulario-perforacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-perforacion.component.html',
  styleUrl: './formulario-perforacion.component.css'
})
export class FormularioPerforacionComponent implements OnInit, OnChanges {

  @Input() visible = false;
  @Input() operacion: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();
  @Input() estado: string = '';

  public formularioInvalido = false;
  public datosPerforacion: DatosPerforacion = this.getInitDatosPerforacion();

  // 🔥 LISTAS DINÁMICAS
  public niveles: string[] = [];
  public tiposLabor: string[] = [];
  public labores: string[] = [];
  public alas: string[] = [];
  public ubicacionesDestino: string[] = ['Caja negra', 'Cancha', 'Stock', 'Planta']; // Ejemplos

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['operacion'] && this.operacion) {
      this.cargarDatosOperacion(this.operacion);
    }
  }

  cargarDatosOperacion(op: any) {
    console.log('📥 Datos recibidos en operacion:', op);

    // 🔥 UBICACIÓN - usando los nuevos nombres con _inicio
    this.datosPerforacion.ubicacion.nivel_inicio = op.nivel_inicio || op.nivel || '';
    this.datosPerforacion.ubicacion.tipo_labor_inicio = op.tipo_labor_inicio || op.tipo_labor || '';
    this.datosPerforacion.ubicacion.labor_inicio = op.labor_inicio || op.labor || '';
    this.datosPerforacion.ubicacion.ala_inicio = op.ala_inicio || op.ala || '';

    // 🔥 NUEVOS CAMPOS
    this.datosPerforacion.n_cucharas = op.n_cucharas || null;
    this.datosPerforacion.ubicacion_destino = op.ubicacion_destino || '';
    this.datosPerforacion.ubicacion_destino_id = op.ubicacion_destino_id || null;

    // 🔥 OBSERVACIONES
    this.datosPerforacion.observaciones = op.observaciones || '';

    // 🔥 ACTUALIZAR LISTAS DINÁMICAS
    this.agregarSiNoExiste(this.niveles, this.datosPerforacion.ubicacion.nivel_inicio);
    this.agregarSiNoExiste(this.tiposLabor, this.datosPerforacion.ubicacion.tipo_labor_inicio);
    this.agregarSiNoExiste(this.labores, this.datosPerforacion.ubicacion.labor_inicio);
    this.agregarSiNoExiste(this.alas, this.datosPerforacion.ubicacion.ala_inicio);
    this.agregarSiNoExiste(this.ubicacionesDestino, this.datosPerforacion.ubicacion_destino);
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
      console.log('✅ Datos guardados:', this.datosPerforacion);
      
      // 🔥 EMITIR EN EL FORMATO QUE ESPERA EL PADRE
      this.guardar.emit({
        ubicacion: {
          nivel_inicio: this.datosPerforacion.ubicacion.nivel_inicio,
          tipo_labor_inicio: this.datosPerforacion.ubicacion.tipo_labor_inicio,
          labor_inicio: this.datosPerforacion.ubicacion.labor_inicio,
          ala_inicio: this.datosPerforacion.ubicacion.ala_inicio
        },
        n_cucharas: this.datosPerforacion.n_cucharas,
        ubicacion_destino: this.datosPerforacion.ubicacion_destino,
        ubicacion_destino_id: this.datosPerforacion.ubicacion_destino_id,
        observaciones: this.datosPerforacion.observaciones
      });
      
      this.formularioInvalido = false;
      this.cerrar.emit();
    } else {
      this.formularioInvalido = true;
      console.warn('⚠️ Formulario inválido: faltan campos obligatorios');
    }
  }

  validarFormulario(): boolean {
    const u = this.datosPerforacion.ubicacion;
    // Solo validar campos obligatorios cuando el estado es OPERATIVO
    if (this.estado === 'OPERATIVO') {
      return !!(u.nivel_inicio && u.tipo_labor_inicio && u.labor_inicio);
    }
    // Si no es OPERATIVO, siempre es válido (solo ubicación opcional)
    return true;
  }

  private getInitDatosPerforacion(): DatosPerforacion {
    return {
      ubicacion: { 
        nivel_inicio: '', 
        tipo_labor_inicio: '', 
        labor_inicio: '', 
        ala_inicio: '' 
      },
      n_cucharas: null,
      ubicacion_destino: '',
      ubicacion_destino_id: null,
      observaciones: ''
    };
  }

  public get mostrarCamposCompletos(): boolean {
    return this.estado === 'OPERATIVO';
  }
}