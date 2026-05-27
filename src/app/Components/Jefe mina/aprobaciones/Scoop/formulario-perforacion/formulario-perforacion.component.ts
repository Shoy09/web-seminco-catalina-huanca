import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

// 🔥 NUEVA INTERFAZ ACTUALIZADA
interface DatosPerforacion {
  labor_inicio: string;
  n_cucharas: number | null;
  ubicacion_destino: string;
  ubicacion_destino_id: number | null;
  material: string;
  mineral: string;
  desmonte: string;
  relave: string;
  relleno: string;
  numero_volquete: string;
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
  public labores: string[] = [];
  public ubicacionesDestino: string[] = ['Caja negra', 'Cancha', 'Stock', 'Planta', 'VOLQUETE'];
  public materiales: string[] = ['DESMONTE', 'MINERAL', 'RELAVE', 'RELLENO'];
  public volquetes: string[] = [];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['operacion'] && this.operacion) {
      this.cargarDatosOperacion(this.operacion);
    }
  }

  cargarDatosOperacion(op: any) {
    console.log('📥 Datos recibidos en operacion:', op);

    // 🔥 CAMPOS ACTUALIZADOS
    this.datosPerforacion.labor_inicio = op.labor_inicio || '';
    this.datosPerforacion.n_cucharas = op.n_cucharas || null;
    this.datosPerforacion.ubicacion_destino = op.ubicacion_destino || '';
    this.datosPerforacion.ubicacion_destino_id = op.ubicacion_destino_id || null;
    this.datosPerforacion.material = op.material || '';
    this.datosPerforacion.mineral = op.mineral || '0';
    this.datosPerforacion.desmonte = op.desmonte || '0';
    this.datosPerforacion.relave = op.relave || '0';
    this.datosPerforacion.relleno = op.relleno || '0';
    this.datosPerforacion.numero_volquete = op.numero_volquete || '';
    this.datosPerforacion.observaciones = op.observaciones || '';

    // 🔥 ACTUALIZAR LISTAS DINÁMICAS
    this.agregarSiNoExiste(this.labores, this.datosPerforacion.labor_inicio);
    this.agregarSiNoExiste(this.ubicacionesDestino, this.datosPerforacion.ubicacion_destino);
    this.agregarSiNoExiste(this.materiales, this.datosPerforacion.material);
    this.agregarSiNoExiste(this.volquetes, this.datosPerforacion.numero_volquete);
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
      
      // 🔥 EMITIR EN EL NUEVO FORMATO
      this.guardar.emit({
        labor_inicio: this.datosPerforacion.labor_inicio,
        n_cucharas: this.datosPerforacion.n_cucharas,
        ubicacion_destino: this.datosPerforacion.ubicacion_destino,
        ubicacion_destino_id: this.datosPerforacion.ubicacion_destino_id,
        material: this.datosPerforacion.material,
        mineral: this.datosPerforacion.mineral,
        desmonte: this.datosPerforacion.desmonte,
        relave: this.datosPerforacion.relave,
        relleno: this.datosPerforacion.relleno,
        numero_volquete: this.datosPerforacion.numero_volquete,
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
    // Solo validar campos obligatorios cuando el estado es OPERATIVO
    if (this.estado === 'OPERATIVO') {
      return !!(this.datosPerforacion.labor_inicio && 
                this.datosPerforacion.n_cucharas &&
                this.datosPerforacion.ubicacion_destino);
    }
    // Si no es OPERATIVO, siempre es válido
    return true;
  }

  private getInitDatosPerforacion(): DatosPerforacion {
    return {
      labor_inicio: '',
      n_cucharas: null,
      ubicacion_destino: '',
      ubicacion_destino_id: null,
      material: '',
      mineral: '0',
      desmonte: '0',
      relave: '0',
      relleno: '0',
      numero_volquete: '',
      observaciones: ''
    };
  }

  public get mostrarCamposCompletos(): boolean {
    return this.estado === 'OPERATIVO';
  }

  // 🔥 MÉTODOS PARA MANEJAR LOS CHECKBOX DE MATERIALES
  onMaterialChange(material: string, checked: boolean) {
    if (checked) {
      this.datosPerforacion.material = material;
      // Resetear los contadores según el material seleccionado
      this.resetMaterialCounters(material);
    } else if (this.datosPerforacion.material === material) {
      this.datosPerforacion.material = '';
    }
  }

  public resetMaterialCounters(material: string) {
    // Resetear todos los contadores a 0
    this.datosPerforacion.mineral = '0';
    this.datosPerforacion.desmonte = '0';
    this.datosPerforacion.relave = '0';
    this.datosPerforacion.relleno = '0';
    
    // Si es necesario, podrías inicializar algún contador específico
    // según el tipo de material, pero por ahora todos empiezan en 0
  }

  isMaterialSelected(material: string): boolean {
    return this.datosPerforacion.material === material;
  }
}