import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechasPlanMensualService } from '../../../services/fechas-plan-mensual.service';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { EquipoService } from '../../../services/equipo.service';
import { TipoPerforacionService } from '../../../services/tipo-perforacion.service';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';
import { TipoEquipoService } from '../../../services/tipo-equipo.service';
import { SeccionService } from '../../../services/seccion.service';
import { LongitudBarrasService } from '../../../services/longitud-barras.service';
import { PernosService } from '../../../services/pernos.service';
import { MallasService } from '../../../services/mallas.service';
import { OrigenDestinoService } from '../../../services/origen-destino.service';
import { GuardiaService } from '../../../services/guardia.service';
import { MaterialService } from '../../../services/material.service';
import { EmpresaService } from '../../../services/empresa.service';
import { ToneladasScoopService } from '../../../services/toneladas-scoop.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CrearDataDialogComponent } from '../crear-data-dialog/crear-data-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-crear-data',
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './crear-data.component.html',
  styleUrl: './crear-data.component.css'
})
export class CrearDataComponent implements OnInit, AfterViewInit {
  // --- estado nuevo (vista inline) ---
  categoriaSeleccionada: string = '';
  categoriaActiva: any = null;
  formularioAbierto: boolean = false;
  filtroBusqueda: string = '';
  dataSource = new MatTableDataSource<any>([]);
  datosPagina: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // --- estado legacy (modal) – se mantiene por compatibilidad con los métodos existentes ---
  modalAbierto = false;
  modalContenido: any = null;
  nuevoDato: any = {}
  formularioActivo: string = 'botones';
  years: number[] = [];
  tiposAceroData: any[] = [];

  editando: boolean = false;
  indiceEditando: number = -1;
  datoOriginal: any = null;
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  datos = [
    { nombre: 'Reporte A', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte B', year: '2024', mes: 'Enero' },
    { nombre: 'Reporte C', year: '2024', mes: 'Enero' }
  ];
  

  constructor(
    private tipoPerforacionService: TipoPerforacionService, 
    private equipoService: EquipoService,
    private FechasPlanMensualService: FechasPlanMensualService,
    private tipoEquipoService: TipoEquipoService,
    public dialog: MatDialog,
    private seccionService: SeccionService,
    private longitudBarrasService: LongitudBarrasService,
  private pernosService: PernosService,
  private mallasService: MallasService,
  private origenDestinoService: OrigenDestinoService,
  private guardiaService: GuardiaService,
    private materialService: MaterialService,
  private empresaService: EmpresaService,
  private toneladasScoopService: ToneladasScoopService,
  ) {}

  ngOnInit() {
    this.generarAños();
    // Iniciar con la primera categoría seleccionada
    if (this.buttonc.length > 0) {
      this.categoriaSeleccionada = this.buttonc[0].tipo;
      this.cargarCategoria(this.buttonc[0]);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => this.actualizarPagina());
  }

  /** Actualiza el slice visible de la tabla según la página actual */
  private actualizarPagina() {
    const filtered = this.dataSource.filteredData;
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    this.datosPagina = filtered.slice(start, start + this.paginator.pageSize);
  }

  generarAños() {
    const yearActual = new Date().getFullYear();
    for (let i = 2020; i <= yearActual; i++) {
      this.years.push(i);
    }
  }

  // ──────────────────────────────────────────────
  // Métodos nuevos para vista inline
  // ──────────────────────────────────────────────

  /** Cambia la categoría activa desde el select */
  onCategoriaChange(tipo: string) {
    const btn = this.buttonc.find(b => b.tipo === tipo);
    if (btn) {
      this.cerrarFormulario();
      this.filtroBusqueda = '';
      this.cargarCategoria(btn);
    }
  }

  /** Carga los datos de la categoría usando la lógica existente de abrirModal */
  cargarCategoria(button: any) {
    this.categoriaActiva = button;
    this.modalContenido = button;
    this.abrirModal(button);
    // abrirModal carga los datos en button.datos (async),
    // sincronizamos el dataSource cuando lleguen via un proxy
    // Para eso usamos un Proxy en el array de datos
    const self = this;
    // Resetear el dataSource mientras cargan
    this.dataSource.data = [];
    if (this.paginator) this.paginator.firstPage();

    // Observamos el array con un setter proxy para sincronizar automáticamente
    // cuando abrirModal asigna modalContenido.datos = data
    const originalSetter = Object.getOwnPropertyDescriptor(button, 'datos');
    let _datos: any[] = button.datos ?? [];
    Object.defineProperty(button, 'datos', {
      get: () => _datos,
      set: (val: any[]) => {
        _datos = val;
        if (self.categoriaActiva === button) {
          self.dataSource.data = val ?? [];
          if (self.paginator) {
            self.paginator.firstPage();
          }
          self.actualizarPagina();
        }
      },
      configurable: true,
    });
  }

  /** Sincroniza el dataSource con el array interno y refresca la paginación */
  private refrescarTabla() {
    this.dataSource.data = [...(this.categoriaActiva?.datos ?? [])];
    this.actualizarPagina();
  }

  /** Recarga los datos desde el servidor y refresca la tabla */
  private recargarDatosCategoria() {
    const tipo = this.modalContenido?.tipo;
    if (!tipo) return;

    const asignar = (data: any[]) => {
      this.categoriaActiva.datos = data;
      this.dataSource.data = [...data];
      if (this.paginator) this.paginator.firstPage();
      this.actualizarPagina();
    };

    if (tipo === 'Tipo de Perforación') {
      this.tipoPerforacionService.getTiposPerforacion().subscribe({
        next: (data) => asignar(data.map((item: any) => ({ ...item, permitido_medicion: item.permitido_medicion === 1 ? 'SI' : 'NO' }))),
        error: (err) => console.error(err)
      });
    } else if (tipo === 'Equipo') {
      this.equipoService.getEquipos().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Fechas Plan Mensual') {
      this.FechasPlanMensualService.getFechas().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Tipo de Equipo') {
      this.tipoEquipoService.getTipos().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Seccion') {
      this.seccionService.getSecciones().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Longitud Barras') {
      this.longitudBarrasService.getAll().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Pernos') {
      this.pernosService.getAll().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Mallas') {
      this.mallasService.getAll().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'OrigenDestino') {
      this.origenDestinoService.getAll().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Guardias') {
      this.guardiaService.getGuardias().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Material') {
      this.materialService.getMateriales().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'Empresa') {
      this.empresaService.getEmpresas().subscribe({ next: asignar, error: (err) => console.error(err) });
    } else if (tipo === 'ToneladasScoop') {
      this.toneladasScoopService.getToneladasScoops().subscribe({ next: asignar, error: (err) => console.error(err) });
    }
  }

  /** Abre el dialog para crear un nuevo registro */
  abrirFormulario() {
    const ref = this.dialog.open(CrearDataDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { categoria: this.categoriaActiva, editando: false },
    });
    ref.afterClosed().subscribe(result => {
      if (result?.accion === 'crear') {
        this.nuevoDato = result.valores;
        this.guardarDatos();
      }
    });
  }

  /** Abre el dialog para editar un registro existente */
  editarDatoInline(dato: any, index: number) {
    // Guardamos el dato real (tiene el id), no el índice de página
    this.datoOriginal = { ...dato };
    const ref = this.dialog.open(CrearDataDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { categoria: this.categoriaActiva, editando: true, dato },
    });
    ref.afterClosed().subscribe(result => {
      if (result?.accion === 'editar') {
        this.nuevoDato = result.valores;
        this.editando = true;
        // indiceEditando = posición real en el array completo, buscado por id
        this.indiceEditando = this.categoriaActiva.datos.findIndex(
          (d: any) => d.id === dato.id
        );
        this.actualizarDatos();
      }
    });
  }

  /** Cierra el panel de formulario (ya no se usa, se mantiene por compatibilidad) */
  cerrarFormulario() {
    this.formularioAbierto = false;
    this.editando = false;
    this.indiceEditando = -1;
    this.nuevoDato = {};
    this.datoOriginal = null;
  }

  /** Aplica el filtro de búsqueda al dataSource */
  aplicarFiltro() {
    this.dataSource.filter = this.filtroBusqueda.trim().toLowerCase();
    if (this.paginator) {
      this.paginator.firstPage();
      this.actualizarPagina();
    }
  }

  /** Devuelve los datos de la página actual (ya filtrados y paginados) */
  datosFiltrados(): any[] {
    return this.datosPagina;
  }

  mostrarFormulario(formulario: string): void {
    this.formularioActivo = formulario;
  }

  buttonc = [
    {
  nombre: 'Tipo de Perforación',
  icon: 'mas.svg',
  tipo: 'Tipo de Perforación',
  datos: [],
  campos: [
    { nombre: 'nombre', label: 'Tipo de Perforación', tipo: 'text' },
    { 
      nombre: 'proceso', 
      label: 'Proceso', 
      tipo: 'select', 
      opciones: [
        'PERFORACIÓN TALADROS LARGOS', 'PERFORACIÓN HORIZONTAL', 'EMPERNADOR', 'SCISSOR', 'SCALAMIN', 'ROMPEBANCOS', 'ANFOCHANGER', 'SCOOPTRAM', 'DUMPER'
      ]
    },
  ]
},
{
  nombre: 'Secciones',
  icon: 'mas.svg',
  tipo: 'Seccion',
  datos: [],
  campos: [
    { 
      nombre: 'proceso',
      label: 'Proceso',
      tipo: 'select',
      opciones: [
        'PERFORACIÓN TALADROS LARGOS', 'PERFORACIÓN HORIZONTAL', 'EMPERNADOR', 'SCISSOR', 'SCALAMIN', 'ROMPEBANCOS', 'ANFOCHANGER', 'SCOOPTRAM', 'DUMPER'
      ]
    },
    { 
      nombre: 'nombre',
      label: 'Nombre de la Sección',
      tipo: 'text'
    }
  ]
},
{
  nombre: 'Origen - Destino',
  icon: 'mas.svg',
  tipo: 'OrigenDestino',
  datos: [],
  campos: [
    { 
      nombre: 'proceso',
      label: 'Proceso',
      tipo: 'select',
      opciones: [
        'SCOOPTRAM',
        'DUMPER'
      ]
    },
    { 
      nombre: 'tipo',
      label: 'Tipo',
      tipo: 'select',
      opciones: ['ORIGEN', 'DESTINO'] 
    },
    { 
      nombre: 'nombre',
      label: 'Nombre',
      tipo: 'text'
    }
  ]
},
    {
      nombre: 'Equipo',
      icon: 'mas.svg',
      tipo: 'Equipo',
      datos: [],
      campos: [
        { nombre: 'nombre', label: 'Nombre', tipo: 'text' },
        { 
      nombre: 'proceso',
      label: 'Proceso',
      tipo: 'select',
      opciones: [
        'PERFORACIÓN TALADROS LARGOS', 'PERFORACIÓN HORIZONTAL', 'EMPERNADOR', 'SCISSOR','ACARREO', 'SCALAMIN', 'ROMPEBANCOS', 'ANFOCHANGER', 'SCOOPTRAM', 'DUMPER'
      ]
    },
        { nombre: 'codigo', label: 'Código', tipo: 'text' },
        { nombre: 'marca', label: 'Marca', tipo: 'text' },
        { nombre: 'modelo', label: 'Modelo', tipo: 'text' },
        { nombre: 'serie', label: 'Serie', tipo: 'text' },
        { nombre: 'anioFabricacion', label: 'Año de Fabricación', tipo: 'number' },
        { nombre: 'fechaIngreso', label: 'Fecha de Ingreso', tipo: 'date' },
        { nombre: 'capacidadYd3', label: 'Capacidad (Yd³)', tipo: 'number' },
        { nombre: 'capacidadM3', label: 'Capacidad (m³)', tipo: 'number' },
        { nombre: 'capacidad_tonelada', label: 'Capacidad Material (Toneladas)', tipo: 'number'},
        {nombre: 'capacidad_tonelada_desmonte', label: 'Capacidad Desmonte (Toneladas)', tipo: 'number'
    }
      ]
    },
    {
  nombre: 'Empresas',
  icon: 'mas.svg',
  tipo: 'Empresa',
  datos: [],
  campos: [
    {
      nombre: 'nombre',
      label: 'Nombre de la Empresa',
      tipo: 'text'
    }
  ]
},
    {
  nombre: 'Tipo de Equipo',
  icon: 'mas.svg',
  tipo: 'Tipo de Equipo',
  datos: [],
  campos: [
    { nombre: 'nombre', label: 'Nombre del Tipo de Equipo', tipo: 'text' }
  ]
},
{
  nombre: 'Longitud de Barras',
  icon: 'mas.svg',
  tipo: 'Longitud Barras',
  datos: [],
  campos: [
    { 
      nombre: 'proceso',
      label: 'Proceso',
      tipo: 'select',
      opciones: [
        'PERFORACIÓN TALADROS LARGOS', 'PERFORACIÓN HORIZONTAL'
      ]
    },
    { nombre: 'longitud_pies', label: 'Longitud (pies)', tipo: 'number' }
  ]
},
{
  nombre: 'Pernos',
  icon: 'mas.svg',
  tipo: 'Pernos',
  datos: [],
  campos: [
    { nombre: 'tipo_perno', label: 'Tipo de Perno', tipo: 'text' },
    { nombre: 'longitud', label: 'Longitud', tipo: 'number' }
  ]
},
{
  nombre: 'Toneladas Scoops',
  icon: 'mas.svg',
  tipo: 'ToneladasScoop',
  datos: [],
  campos: [
    {
      nombre: 'fecha',
      label: 'Fecha',
      tipo: 'date'
    },
    {
      nombre: 'turno',
      label: 'Turno',
      tipo: 'select',
      opciones: ['DIA', 'NOCHE']
    },
    {
  nombre: 'mineral',
  label: 'Mineral',
  tipo: 'select',
  opciones: []
},
    {
      nombre: 'factor',
      label: 'Factor',
      tipo: 'number'
    }
  ]
},
{
  nombre: 'Mallas',
  icon: 'mas.svg',
  tipo: 'Mallas',
  datos: [],
  campos: [
    { nombre: 'tipo_malla', label: 'Tipo de Malla', tipo: 'text' }
  ]
},
    {
      nombre: 'Fechas Plan Mensual',
      icon: 'mas.svg',
      tipo: 'Fechas Plan Mensual',
      datos: [],
      campos: [
        { nombre: 'mes', label: 'Mes', tipo: 'text' },
      ]
    },
    {
  nombre: 'Guardias',
  icon: 'mas.svg',
  tipo: 'Guardias',
  datos: [],
  campos: [
    { nombre: 'guardia', label: 'Guardia', tipo: 'text' }
  ]
},
    {
    nombre: 'Materiales',
    icon: 'mas.svg',
    tipo: 'Material',
    datos: [],
    campos: [
        {
            nombre: 'proceso',
            label: 'Proceso',
            tipo: 'select',
            opciones: [
                'SCOOPTRAM',
                'ACARREO'
            ]
        },
        {
            nombre: 'nombre',
            label: 'Nombre del Material',
            tipo: 'text'
        }
    ]
},
  ];  

  cerrarModal() {
    this.modalAbierto = false;
    this.modalContenido = null;
    this.cerrarFormulario();
  }

  triggerFileInput() {
    // Simula el clic en el input de archivo cuando se hace clic en el botón "Importar Excel"
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
  
  importarExcel() {
    if (this.modalContenido) {
      this.cargarExcel(this.modalContenido.nombre);
    } else {
      
    }
  }

  editarDato(dato: any, index: number) {
  this.editando = true;
  this.indiceEditando = index;
  this.datoOriginal = {...dato};
  
  // Clonamos el dato para editarlo
  this.nuevoDato = {...dato};
}

// Función para actualizar un registro
actualizarDatos() {
  if (Object.values(this.nuevoDato).some(val => val !== '')) {
    const datosActualizados = { ...this.nuevoDato };
    const id = this.categoriaActiva.datos[this.indiceEditando].id;

    const onSuccess = (data: any) => {
      this.categoriaActiva.datos[this.indiceEditando] = data;
      this.refrescarTabla();
      this.cancelarEdicion();
    };

    if (this.modalContenido.tipo === 'Tipo de Perforación') {
      if (datosActualizados.permitido_medicion === 'SI') datosActualizados.permitido_medicion = 1;
      else if (datosActualizados.permitido_medicion === 'NO') datosActualizados.permitido_medicion = 0;
      this.tipoPerforacionService.updateTipoPerforacion(id, datosActualizados).subscribe({
        next: (data) => { data.permitido_medicion = data.permitido_medicion === 1 ? 'SI' : 'NO'; onSuccess(data); },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else if (this.modalContenido.tipo === 'Equipo') {
      this.equipoService.updateEquipo(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar:', err) });
    } else if (this.modalContenido.tipo === 'Fechas Plan Mensual') {
      this.FechasPlanMensualService.updateFecha(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Fecha Plan Mensual:', err) });
    } else if (this.modalContenido.tipo === 'Tipo de Equipo') {
      this.tipoEquipoService.updateTipo(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Tipo de Equipo:', err) });
    } else if (this.modalContenido.tipo === 'Seccion') {
      this.seccionService.updateSeccion(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Sección:', err) });
    } else if (this.modalContenido.tipo === 'Longitud Barras') {
      this.longitudBarrasService.update(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Longitud Barras:', err) });
    } else if (this.modalContenido.tipo === 'Pernos') {
      this.pernosService.update(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Perno:', err) });
    } else if (this.modalContenido.tipo === 'Mallas') {
      this.mallasService.update(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Malla:', err) });
    } else if (this.modalContenido.tipo === 'OrigenDestino') {
      this.origenDestinoService.update(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar OrigenDestino:', err) });
    } else if (this.modalContenido.tipo === 'Guardias') {
      this.guardiaService.updateGuardia(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Guardia:', err) });
    } else if (this.modalContenido.tipo === 'Material') {
      this.materialService.updateMaterial(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Material:', err) });
    } else if (this.modalContenido.tipo === 'Empresa') {
      this.empresaService.updateEmpresa(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Empresa:', err) });
    } else if (this.modalContenido.tipo === 'ToneladasScoop') {
      if (datosActualizados.fecha) datosActualizados.fecha = this.formatearFecha(datosActualizados.fecha);
      this.toneladasScoopService.updateToneladasScoop(id, datosActualizados).subscribe({ next: onSuccess, error: (err) => console.error('Error al actualizar Toneladas Scoop:', err) });
    }
  }
}


// Función para cancelar la edición
cancelarEdicion() {
  this.editando = false;
  this.indiceEditando = -1;
  this.nuevoDato = {};
  this.datoOriginal = null;
}

cargarExcel(nombre: string) {
  if (nombre === 'Equipo' || nombre === 'Toneladas' || nombre === 'Acero' || 
      nombre === 'Jefe Guardia Acero' || nombre === 'Operador Acero') {
    this.triggerFileInput(); // Activa la selección de archivo
  } else {
    console.warn('Importación de Excel no implementada para:', nombre);
  }
}

  procesarArchivoExcel(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  // Determinar qué función de procesamiento usar basado en el contenido del modal
  if (this.modalContenido) {
    switch (this.modalContenido.nombre) {
      case 'Equipo':
        this.procesarExcelEquipo(event);
        break;
      
      default:
        console.warn('No hay procesador definido para:', this.modalContenido.nombre);
        break;
    }
  }

  // Limpiar el input file para permitir subir el mismo archivo otra vez
  event.target.value = '';
}

private buscarHojaExcel(workbook: any, nombresPosibles: string[]): string {
  // Buscar por nombres exactos primero
  for (const nombre of nombresPosibles) {
    if (workbook.SheetNames.includes(nombre)) {
      return nombre;
    }
  }
  
  // Buscar por nombres que contengan las palabras (case insensitive)
  const nombresDisponibles = workbook.SheetNames;
  for (const nombreBuscado of nombresPosibles) {
    const hojaEncontrada = nombresDisponibles.find((nombreHoja: string) => 
      nombreHoja.toLowerCase().includes(nombreBuscado.toLowerCase())
    );
    if (hojaEncontrada) {
      return hojaEncontrada;
    }
  }
  
  // Si no encuentra ninguna, devolver la primera hoja como fallback
  console.warn('No se encontró ninguna hoja con los nombres:', nombresPosibles, 'usando primera hoja');
  return workbook.SheetNames[0];
}



  
  procesarExcelEquipo(event: any) {
    const file = event.target.files[0];
  
    if (!file) {
      
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Convertimos la hoja de Excel en JSON
      const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });
  
      const equipos = excelData.map(row => ({
        nombre: row["EQUIPO"] || null,
        proceso: row["PROCESO"] || null,
        codigo: row["CODIGO"] || null,
        marca: row["MARCA"] || null,
        modelo: row["MODELO"] || null,
        serie: row["SERIE"] || null,
        anioFabricacion: row["AÑO DE FABRICACIÓN"] ? Number(row["AÑO DE FABRICACIÓN"]) : null,
        fechaIngreso: this.convertirFechaExcel(row["FECHA DE INGRESO"]),
        capacidadYd3: row["CAPACIDAD (yd3)"] ? Number(row["CAPACIDAD (yd3)"]) : null,
        capacidadM3: row["CAPACIDAD (m3)"] ? Number(row["CAPACIDAD (m3)"]) : null
      }));

  
      // 🔹 Cerrar el modal antes de enviar los datos
      this.cerrarModal();
  
      // 🔹 Mostrar pantalla de carga
      const dialogRef = this.mostrarPantallaCarga();
  
      // 🔹 Enviar los datos a la API
      this.enviarEquipos(equipos)
        .then(() => {
          
          this.dialog.closeAll();
        })
        .catch((error) => {
          console.error('❌ Error al enviar datos:', error);
          this.dialog.closeAll();
        });
    };
  
    reader.readAsArrayBuffer(file);
  }
  
  convertirFechaExcel(valor: any): string | null {
    if (!valor) return null;
  
    // Si la fecha ya está en formato texto, devolverla tal cual
    if (typeof valor === "string") return valor;
  
    // Si la fecha es un número, convertirla usando XLSX
    if (typeof valor === "number") {
      const fecha = XLSX.SSF.parse_date_code(valor);
      return `${fecha.y}-${String(fecha.m).padStart(2, '0')}-${String(fecha.d).padStart(2, '0')}`;
    }
  
    return null;
  }
  
  enviarEquipos(equipos: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const peticiones = equipos.map(nuevoRegistro => 
        this.equipoService.createEquipo(nuevoRegistro).toPromise()
      );
  
      Promise.all(peticiones)
        .then((responses) => {
          responses.forEach(data => this.modalContenido.datos.push(data));
          
          resolve();
        })
        .catch((error) => {
          console.error('❌ Error en la carga de equipos:', error);
          reject(error);
        });
    });
  }
  
  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
  }

  
  abrirModal(button: any) {
    this.modalAbierto = true;
    this.modalContenido = button;
  
    if (button.tipo === 'Tipo de Perforación') {
  this.tipoPerforacionService.getTiposPerforacion().subscribe({
    next: (data) => {
      // Mapear 1 -> 'SI' y 0 -> 'NO' antes de asignar
      this.modalContenido.datos = data.map(item => ({
        ...item,
        permitido_medicion: item.permitido_medicion === 1 ? 'SI' : 'NO'
      }));
    },
    error: (err) => console.error('Error al cargar Tipo de Perforación:', err)
  });
} else if (button.tipo === 'Equipo') {
      this.equipoService.getEquipos().subscribe({
        next: (data) => {
          this.modalContenido.datos = data; // Asigna los datos recibidos
          
        },
        error: (err) => console.error('Error al cargar Equipo:', err)
      });
    }else if (button.tipo === 'Fechas Plan Mensual') {
      this.FechasPlanMensualService.getFechas().subscribe({
        next: (data) => {
          this.modalContenido.datos = data; // Asigna los datos recibidos
          
        },
        error: (err) => console.error('Error al cargar:', err)
      });
    }else if (button.tipo === 'Tipo de Equipo') {
  this.tipoEquipoService.getTipos().subscribe({
    next: (data) => {
      this.modalContenido.datos = data; // Cargar los tipos de equipo
    },
    error: (err) => console.error('Error al cargar Tipo de Equipo:', err)
  });
}else if (button.tipo === 'Seccion') {
  this.seccionService.getSecciones().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Secciones:', err)
  });
}else if (button.tipo === 'Longitud Barras') {
  this.longitudBarrasService.getAll().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Longitud Barras:', err)
  });
}
else if (button.tipo === 'Pernos') {
  this.pernosService.getAll().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Pernos:', err)
  });
}
else if (button.tipo === 'Mallas') {
  this.mallasService.getAll().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Mallas:', err)
  });
}else if (button.tipo === 'OrigenDestino') {
  this.origenDestinoService.getAll().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar OrigenDestino:', err)
  });
}else if (button.tipo === 'Guardias') {
  this.guardiaService.getGuardias().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Guardias:', err)
  });
}else if (button.tipo === 'Material') {
    this.materialService.getMateriales().subscribe({
        next: (data) => {
            this.modalContenido.datos = data;
        },
        error: (err) => console.error('Error al cargar Materiales:', err)
    });
}else if (button.tipo === 'Empresa') {
  this.empresaService.getEmpresas().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Empresas:', err)
  });
}else if (button.tipo === 'ToneladasScoop') {

  this.toneladasScoopService.getToneladasScoops().subscribe({
    next: (data) => {
      this.modalContenido.datos = data;
    },
    error: (err) => console.error('Error al cargar Toneladas Scoop:', err)
  });

  this.materialService.getMaterialesByProceso('SCOOPTRAM').subscribe({
    next: (materiales) => {

      const campoMineral = this.modalContenido.campos.find(
        (c: any) => c.nombre === 'mineral'
      );

      if (campoMineral) {
        campoMineral.opciones = materiales.map(m => m.nombre);
      }
    },
    error: (err) => console.error('Error al cargar materiales:', err)
  });
}

  }

  onCampoChange(nombreCampo: string) {
  // Solo actuamos si el campo modificado es 'proceso'
  if (nombreCampo === 'proceso' && this.modalContenido.tipo === 'Acero') {
    const procesoSeleccionado = this.nuevoDato['proceso'];

    // Filtrar tipos de acero que pertenecen a ese proceso
    const tiposFiltrados = this.tiposAceroData
      .filter(t => t.proceso === procesoSeleccionado)
      .map(t => t.tipo_acero);

    // Actualizar dinámicamente el select de tipo_acero
    const campoTipoAcero = this.modalContenido.campos.find((c: { nombre: string; }) => c.nombre === 'tipo_acero');
    if (campoTipoAcero) {
      campoTipoAcero.opciones = tiposFiltrados;
    }

    // Limpiar selección previa
    this.nuevoDato['tipo_acero'] = '';
  }
}


  guardarDatos() {
    if (Object.values(this.nuevoDato).some(val => val !== '')) {
      const nuevoRegistro = { ...this.nuevoDato };

      // Después de crear, recargamos desde el servidor para garantizar datos correctos
      const onSuccess = () => {
        this.nuevoDato = {};
        this.recargarDatosCategoria();
      };

      if (this.modalContenido.tipo === 'Tipo de Perforación') {
        if (nuevoRegistro.permitido_medicion === 'SI') nuevoRegistro.permitido_medicion = 1;
        else if (nuevoRegistro.permitido_medicion === 'NO') nuevoRegistro.permitido_medicion = 0;
        this.tipoPerforacionService.createTipoPerforacion(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Tipo de Perforación:', err) });
      } else if (this.modalContenido.tipo === 'Equipo') {
        this.equipoService.createEquipo(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Equipo:', err) });
      } else if (this.modalContenido.tipo === 'Fechas Plan Mensual') {
        this.FechasPlanMensualService.createFecha(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Fecha:', err) });
      } else if (this.modalContenido.tipo === 'Tipo de Equipo') {
        this.tipoEquipoService.createTipo(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Tipo de Equipo:', err) });
      } else if (this.modalContenido.tipo === 'Seccion') {
        this.seccionService.createSeccion(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Sección:', err) });
      } else if (this.modalContenido.tipo === 'Longitud Barras') {
        this.longitudBarrasService.create(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Longitud Barras:', err) });
      } else if (this.modalContenido.tipo === 'Pernos') {
        this.pernosService.create(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Perno:', err) });
      } else if (this.modalContenido.tipo === 'Mallas') {
        this.mallasService.create(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Malla:', err) });
      } else if (this.modalContenido.tipo === 'OrigenDestino') {
        this.origenDestinoService.create(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar OrigenDestino:', err) });
      } else if (this.modalContenido.tipo === 'Guardias') {
        this.guardiaService.createGuardia(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Guardia:', err) });
      } else if (this.modalContenido.tipo === 'Material') {
        this.materialService.createMaterial(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Material:', err) });
      } else if (this.modalContenido.tipo === 'Empresa') {
        this.empresaService.createEmpresa(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Empresa:', err) });
      } else if (this.modalContenido.tipo === 'ToneladasScoop') {
        if (nuevoRegistro.fecha) nuevoRegistro.fecha = this.formatearFecha(nuevoRegistro.fecha);
        this.toneladasScoopService.createToneladasScoop(nuevoRegistro).subscribe({ next: onSuccess, error: (err) => console.error('Error al guardar Toneladas Scoop:', err) });
      }
    }
  }

  eliminar(item: any): void {
    if (!item || !this.modalContenido) return;

    const quitarDeTabla = () => {
      this.categoriaActiva.datos = this.categoriaActiva.datos.filter((d: any) => d.id !== item.id);
      this.refrescarTabla();
    };

    if (this.modalContenido.tipo === 'Tipo de Perforación') {
      this.tipoPerforacionService.deleteTipoPerforacion(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Tipo de Perforación:', err) });
    } else if (this.modalContenido.tipo === 'Equipo') {
      this.equipoService.deleteEquipo(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Equipo:', err) });
    } else if (this.modalContenido.tipo === 'Fechas Plan Mensual') {
      this.FechasPlanMensualService.deleteFecha(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Fecha:', err) });
    } else if (this.modalContenido.tipo === 'Tipo de Equipo') {
      this.tipoEquipoService.deleteTipo(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Tipo de Equipo:', err) });
    } else if (this.modalContenido.tipo === 'Seccion') {
      this.seccionService.deleteSeccion(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Sección:', err) });
    } else if (this.modalContenido.tipo === 'Longitud Barras') {
      this.longitudBarrasService.delete(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Longitud Barras:', err) });
    } else if (this.modalContenido.tipo === 'Pernos') {
      this.pernosService.delete(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Perno:', err) });
    } else if (this.modalContenido.tipo === 'Mallas') {
      this.mallasService.delete(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Malla:', err) });
    } else if (this.modalContenido.tipo === 'OrigenDestino') {
      this.origenDestinoService.delete(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar OrigenDestino:', err) });
    } else if (this.modalContenido.tipo === 'Guardias') {
      this.guardiaService.deleteGuardia(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Guardia:', err) });
    } else if (this.modalContenido.tipo === 'Material') {
      this.materialService.deleteMaterial(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Material:', err) });
    } else if (this.modalContenido.tipo === 'Empresa') {
      this.empresaService.deleteEmpresa(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Empresa:', err) });
    } else if (this.modalContenido.tipo === 'ToneladasScoop') {
      this.toneladasScoopService.deleteToneladasScoop(item.id).subscribe({ next: quitarDeTabla, error: (err) => console.error('Error al eliminar Toneladas Scoop:', err) });
    }
  }

  formatearFecha(fecha: string | Date): string {
  const d = new Date(fecha);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

  descargar(item: any): void {}
}