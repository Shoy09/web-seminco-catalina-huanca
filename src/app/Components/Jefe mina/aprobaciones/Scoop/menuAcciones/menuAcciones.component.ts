import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface AccionItem {
  id: string;
  texto: string;
  icono: string;
}

@Component({
  selector: 'app-menuAcciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menuAcciones.component.html',
  styleUrls: ['./menuAcciones.component.css']
})
export class MenuAccionesComponent implements OnInit, OnChanges {

  // 🔥 Inputs desde el padre
  @Input() horometrosData: any;
  @Input() condicionesData: any;
  @Input() checkListData: any[] = [];
  @Input() llantasData: any;
  @Input() programaTrabajoData: any;
  
  // 🔥 Outputs para comunicar cambios al padre
  @Output() actualizarClick = new EventEmitter<void>();
  @Output() dataChange = new EventEmitter<any>();

  // 🔥 Arrays usados en los modales
  public filasHorometro: any[] = [];
  public condicionesEquipo: any[] = [];
  public itemsChecklist: any[] = [];
  public llantasInspeccion: any[] = [];
public programaTrabajoLocal: any;
  // 🔥 Copias locales para edición (para no modificar directamente los inputs)
  private horometrosDataBackup: any;
  private condicionesDataBackup: any;
  private checkListDataBackup: any[] = [];
  private llantasDataBackup: any;
  private programaTrabajoDataBackup: any;

  // 🔥 Acciones del menú
  public acciones: AccionItem[] = [
    { id: 'horometro', texto: 'Horómetro', icono: 'fa-gauge' },
    { id: 'condiciones', texto: 'Condiciones de equipo', icono: 'fa-screwdriver-wrench' },
    { id: 'checklist', texto: 'CheckList', icono: 'fa-list-check' },
    { id: 'presion', texto: 'Presión de llantas', icono: 'fa-truck-field' },
    { id: 'programaTrabajo', texto: 'Programa Trabajo', icono: 'fa-calendar-check' },
    { id: 'actualizar', texto: 'Actualizar registro', icono: 'fa-arrows-rotate' },
  ];
  public accionSeleccionada: string = '';

  // 🔥 Estados de visibilidad de modales
  public mostrarModalHorometro: boolean = false;
  public mostrarModalCondiciones: boolean = false;
  public mostrarModalChecklist: boolean = false;
  public mostrarModalInspeccion: boolean = false;
  public mostrarModalProgramaTrabajo: boolean = false;

  // 🔥 Imagen de inspección de llantas
  public imagenEquipoUrl: string = 'inspec-visual/image-prueba.jpeg';

  public opcionesEstado = ['Operativo', 'Regular', 'Inoperativo', 'N/A'];

  constructor() { }

  ngOnInit() { }

  // 🔥 Detecta cambios en los Inputs y actualiza arrays
  ngOnChanges(changes: SimpleChanges) {
    if (changes['horometrosData'] && this.horometrosData) {
      this.horometrosDataBackup = JSON.parse(JSON.stringify(this.horometrosData));
      this.inicializarHorometros(this.horometrosData);
    }

    if (changes['condicionesData'] && this.condicionesData) {
      this.condicionesDataBackup = JSON.parse(JSON.stringify(this.condicionesData));
      this.inicializarCondiciones(this.condicionesData);
      console.log('📥 Condiciones recibidas del padre:', this.condicionesData);
    }

    if (changes['checkListData'] && this.checkListData) {
      this.checkListDataBackup = JSON.parse(JSON.stringify(this.checkListData));
      this.inicializarChecklist(this.checkListData);
      console.log('📥 CheckList recibida del padre:', this.checkListData);
    }

    if (changes['llantasData'] && this.llantasData) {
      this.llantasDataBackup = JSON.parse(JSON.stringify(this.llantasData));
      this.inicializarLlantas(this.llantasData);
      console.log('📥 Llantas recibidas del padre:', this.llantasData);
    }

    if (changes['programaTrabajoData'] && this.programaTrabajoData) {
  this.programaTrabajoDataBackup = JSON.parse(JSON.stringify(this.programaTrabajoData));
  this.inicializarProgramaTrabajo(this.programaTrabajoData);
  console.log('📥 Programa Trabajo recibido:', this.programaTrabajoData);
}
  }

  inicializarProgramaTrabajo(data: any) {
  this.programaTrabajoLocal = {
    n_cucharas_programado: data?.n_cucharas_programado ?? 0,
    n_cucharas_realizado: data?.n_cucharas_realizado ?? 0
  };
}

  // 🔥 Inicializa Horómetros (SOSTENIMIENTO)
  inicializarHorometros(data: any) {
    const map = (item: any) => ({
      inicial: Number(item?.inicio ?? 0),
      final: Number(item?.final ?? 0),
      op: item?.op === true || item?.op === 1,
      inop: item?.inop === true || item?.inop === 1,
    });

    this.filasHorometro = [
      { nombre: 'horometro', ...map(data?.horometro) },
    ];
  }

  // 🔥 Inicializa Condiciones de equipo
  inicializarCondiciones(data: any) {
    this.condicionesEquipo = [
      { item: 'Aceite Hidráulico', estado: data.aceiteHidraulico ? 'Operativo' : 'Inoperativo', observacion: '' },
      { item: 'Aceite Motor', estado: data.aceiteMotor ? 'Operativo' : 'Inoperativo', observacion: '' },
      { item: 'Aceite Transmisión', estado: data.aceiteTransmision ? 'Operativo' : 'Inoperativo', observacion: '' },
      { item: 'Combustible', estado: data.combustible ? 'Operativo' : 'Inoperativo', observacion: '' },
      { item: 'Lugar', estado: 'Info', observacion: data.lugar || '' },
      { item: 'Operativo/No Operativo', estado: data.op ? 'Operativo' : 'Inoperativo', observacion: '' }
    ];
  }

  inicializarChecklist(data: any[]) {
    this.itemsChecklist = data.map(item => ({
      categoria: item.categoria || 'General',
      descripcion: item.descripcion || 'Item',
      decision: item.decision === true || item.decision === 1,
      observacion: item.observacion || ''
    }));
  }

  inicializarLlantas(data: any) {
    // Convertimos cada propiedad en un objeto con id y estado
    this.llantasInspeccion = Object.keys(data).map(key => ({
      id: key,
      estado: data[key] === true
    }));
  }

  // 🔥 Manejo de selección de acción
  seleccionarAccion(id: string) {
    this.accionSeleccionada = id;
    
    switch(id) {
      case 'horometro':
        this.mostrarModalHorometro = true;
        break;
      case 'condiciones':
        this.mostrarModalCondiciones = true;
        break;
      case 'checklist':
        this.mostrarModalChecklist = true;
        break;
      case 'presion':
        this.mostrarModalInspeccion = true;
        break;
      case 'actualizar':
        this.actualizarClick.emit(); // 🔥 AVISA AL PADRE
        break;
      case 'programaTrabajo':
      this.mostrarModalProgramaTrabajo = true;
        break;
    }
  }

  // 🔥 Cierra todos los modales
  cerrarModales() {
    this.mostrarModalHorometro = false;
    this.mostrarModalCondiciones = false;
    this.mostrarModalChecklist = false;
    this.mostrarModalInspeccion = false;
    this.mostrarModalProgramaTrabajo = false;
    this.accionSeleccionada = '';
  }

  guardarProgramaTrabajo() {
  const data = {
    n_cucharas_programado: Number(this.programaTrabajoLocal?.n_cucharas_programado ?? 0),
    n_cucharas_realizado: Number(this.programaTrabajoLocal?.n_cucharas_realizado ?? 0)
  };

  console.log('🟢 Programa Trabajo guardado:', data);

  this.dataChange.emit({
    tipo: 'programaTrabajo',
    data
  });

  this.cerrarModales();
}

  // 🔥 Guardar Horómetros y emitir cambios
  guardarHorometros() {
    const map = (item: any) => ({
      inicio: Number(item.inicial ?? 0),
      final: Number(item.final ?? 0),
      op: item.op ? 1 : 0,
      inop: item.inop ? 1 : 0,
    });

    const data = {
      horometro: map(this.filasHorometro[0]),
    };

    console.log('🟢 Horómetros guardados:', data);
    this.dataChange.emit({ tipo: 'horometros', data });
    this.cerrarModales();
  }

  // 🔥 Guardar Condiciones y emitir cambios
  guardarCondiciones() {
  console.log('Condiciones:', this.condicionesData);

  this.dataChange.emit({
    tipo: 'condiciones',
    data: this.condicionesData
  });

  this.cerrarModales();
}

  // 🔥 Guardar Checklist y emitir cambios
  guardarChecklist() {
    const data = this.itemsChecklist.map(item => ({
      categoria: item.categoria,
      descripcion: item.descripcion,
      decision: item.decision ? 1 : 0,
      observacion: item.observacion
    }));

    console.log('🟢 Checklist guardado:', data);
    this.dataChange.emit({ tipo: 'checklist', data });
    this.cerrarModales();
  }

  // 🔥 Guardar Inspección de llantas y emitir cambios
  guardarInspeccion() {
    const data = this.llantasInspeccion.reduce((acc: any, item: any) => {
      acc[item.id] = item.estado;
      return acc;
    }, {});

    console.log('🟢 Llantas guardadas:', data);
    this.dataChange.emit({ tipo: 'llantas', data });
    this.cerrarModales();
  }

  // 🔥 Toggle para horometro op/inop
  toggleStatus(fila: any, tipo: string) {
    fila.op = (tipo === 'op');
    fila.inop = (tipo === 'inop');
  }
}