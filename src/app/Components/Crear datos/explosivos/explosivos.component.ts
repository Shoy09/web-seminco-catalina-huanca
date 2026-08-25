import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExplosivoService } from '../../../services/explosivo.service';
import { AccesorioService } from '../../../services/accesorio.service';
import { ExplosivosUniService } from '../../../services/explosivos-uni.service';
import { NumeroRetardosService } from '../../../services/numero-retardos.service';
import { CrearDataDialogComponent } from '../crear-data-dialog/crear-data-dialog.component';
import { NumeroRetardosDialogComponent } from '../numero-retardos-dialog/numero-retardos-dialog.component';

@Component({
  selector: 'app-explosivos',
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
  templateUrl: './explosivos.component.html',
  styleUrl: './explosivos.component.css',
})
export class ExplosivosComponent implements OnInit, AfterViewInit {

  // ── Vista inline ──
  categoriaSeleccionada: string = '';
  categoriaActiva: any = null;
  filtroBusqueda: string = '';
  dataSource = new MatTableDataSource<any>([]);
  datosPagina: any[] = [];

  // ── Legacy (compatibilidad con lógica existente) ──
  modalAbierto = false;
  modalContenido: any = null;
  nuevoDato: any = {};
  formularioActivo: string = 'botones';
  years: number[] = [];
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private explosivoService: ExplosivoService,
    private accesorioService: AccesorioService,
    private ExplosivosUniService: ExplosivosUniService,
    private numeroRetardosService: NumeroRetardosService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.generarAños();
    if (this.buttonc.length > 0) {
      this.categoriaSeleccionada = this.buttonc[0].tipo;
      this.cargarCategoria(this.buttonc[0]);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => this.actualizarPagina());
  }

  generarAños() {
    const yearActual = new Date().getFullYear();
    for (let i = 2020; i <= yearActual; i++) {
      this.years.push(i);
    }
  }

  // ── Categorías ──

  onCategoriaChange(tipo: string) {
    const btn = this.buttonc.find(b => b.tipo === tipo);
    if (btn) {
      this.filtroBusqueda = '';
      this.cargarCategoria(btn);
    }
  }

  cargarCategoria(button: any) {
    this.categoriaActiva = button;
    this.modalContenido = button;
    this.dataSource.data = [];
    if (this.paginator) this.paginator.firstPage();
    this.abrirModal(button);

    const self = this;
    let _datos: any[] = button.datos ?? [];
    Object.defineProperty(button, 'datos', {
      get: () => _datos,
      set: (val: any[]) => {
        _datos = val;
        if (self.categoriaActiva === button) {
          self.dataSource.data = [...(val ?? [])];
          if (self.paginator) self.paginator.firstPage();
          self.actualizarPagina();
        }
      },
      configurable: true,
    });
  }

  // ── Paginación ──

  private actualizarPagina() {
    const filtered = this.dataSource.filteredData;
    if (!this.paginator) { this.datosPagina = filtered; return; }
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    this.datosPagina = filtered.slice(start, start + this.paginator.pageSize);
  }

  aplicarFiltro() {
    this.dataSource.filter = this.filtroBusqueda.trim().toLowerCase();
    if (this.paginator) this.paginator.firstPage();
    this.actualizarPagina();
  }

  // ── Tabla ──

  private refrescarTabla() {
    this.dataSource.data = [...(this.categoriaActiva?.datos ?? [])];
    this.actualizarPagina();
  }

  private recargarDatosCategoria() {
    const tipo = this.modalContenido?.tipo;
    if (!tipo) return;

    const asignar = (data: any[]) => {
      this.categoriaActiva.datos = data;
      this.dataSource.data = [...data];
      if (this.paginator) this.paginator.firstPage();
      this.actualizarPagina();
    };

    if (tipo === 'explosivo') {
      this.explosivoService.getExplosivos().subscribe({ next: asignar, error: (e) => console.error(e) });
    } else if (tipo === 'accesorio') {
      this.accesorioService.getAccesorios().subscribe({ next: asignar, error: (e) => console.error(e) });
    } else if (tipo === 'Retardos') {
      this.ExplosivosUniService.getExplosivos().subscribe({ next: asignar, error: (e) => console.error(e) });
    } else if (tipo === 'Numeros retardos') {
      this.numeroRetardosService.getAll().subscribe({ next: asignar, error: (e) => console.error(e) });
    }
  }

  // ── Dialog crear ──

  abrirFormulario(tipo: string) {
    if (tipo === 'Numeros retardos') {
      const ref = this.dialog.open(NumeroRetardosDialogComponent, {
        width: '560px',
        maxWidth: '95vw',
        autoFocus: false,
        data: { editando: false },
      });
      ref.afterClosed().subscribe(result => {
        if (result?.accion === 'crear') {
          this.nuevoDato = result.valores;
          this.guardarDatos();
        }
      });
    } else {
      const categoria = this.buttonc.find(b => b.tipo === tipo);
      const ref = this.dialog.open(CrearDataDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        autoFocus: false,
        data: { categoria, editando: false },
      });
      ref.afterClosed().subscribe(result => {
        if (result?.accion === 'crear') {
          this.nuevoDato = result.valores;
          this.guardarDatos();
        }
      });
    }
  }

  editarDato(dato: any, tipo: string) {
    if (tipo === 'Numeros retardos') {
      const ref = this.dialog.open(NumeroRetardosDialogComponent, {
        width: '560px',
        maxWidth: '95vw',
        autoFocus: false,
        data: { editando: true, dato },
      });
      ref.afterClosed().subscribe(result => {
        if (result?.accion === 'editar') {
          this.actualizarDato(dato.id, result.valores);
        }
      });
    } else {
      const categoria = this.buttonc.find(b => b.tipo === tipo);
      const ref = this.dialog.open(CrearDataDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        autoFocus: false,
        data: { categoria, editando: true, dato },
      });
      ref.afterClosed().subscribe(result => {
        if (result?.accion === 'editar') {
          this.actualizarDato(dato.id, result.valores);
        }
      });
    }
  }

  actualizarDato(id: number, valores: any) {
    const tipo = this.modalContenido?.tipo;
    if (!tipo) return;

    const onSuccess = () => this.recargarDatosCategoria();

    if (tipo === 'explosivo') {
      this.explosivoService.updateExplosivo(id, valores).subscribe({ next: onSuccess, error: (e) => console.error(e) });
    } else if (tipo === 'accesorio') {
      this.accesorioService.updateAccesorio(id, valores).subscribe({ next: onSuccess, error: (e) => console.error(e) });
    } else if (tipo === 'Retardos') {
      this.ExplosivosUniService.updateExplosivo(id, valores).subscribe({ next: onSuccess, error: (e) => console.error(e) });
    } else if (tipo === 'Numeros retardos') {
      this.numeroRetardosService.update(id, valores).subscribe({ next: onSuccess, error: (e) => console.error(e) });
    }
  }

  // ── CRUD ──

  abrirModal(button: any) {
    this.modalAbierto = true;
    this.modalContenido = button;

    if (button.tipo === 'explosivo') {
      this.explosivoService.getExplosivos().subscribe({
        next: (data) => { this.modalContenido.datos = data; },
        error: (err) => console.error('Error al cargar explosivos:', err),
      });
    } else if (button.tipo === 'accesorio') {
      this.accesorioService.getAccesorios().subscribe({
        next: (data) => { this.modalContenido.datos = data; },
        error: (err) => console.error('Error al cargar accesorios:', err),
      });
    } else if (button.tipo === 'Retardos') {
      this.ExplosivosUniService.getExplosivos().subscribe({
        next: (data) => { this.modalContenido.datos = data; },
        error: (err) => console.error('Error al cargar retardos:', err),
      });
    } else if (button.tipo === 'Numeros retardos') {
      this.numeroRetardosService.getAll().subscribe({
        next: (data) => { this.modalContenido.datos = data; },
        error: (err) => console.error('Error al cargar números retardos:', err),
      });
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modalContenido = null;
  }

  guardarDatos() {
    if (Object.values(this.nuevoDato).some(val => val !== '')) {
      const nuevoRegistro = { ...this.nuevoDato };

      const onSuccess = () => {
        this.nuevoDato = {};
        this.recargarDatosCategoria();
      };

      if (this.modalContenido.tipo === 'explosivo') {
        this.explosivoService.createExplosivo(nuevoRegistro).subscribe({ next: onSuccess, error: (e) => console.error('Error al guardar explosivo:', e) });
      } else if (this.modalContenido.tipo === 'accesorio') {
        this.accesorioService.createAccesorio(nuevoRegistro).subscribe({ next: onSuccess, error: (e) => console.error('Error al guardar accesorio:', e) });
      } else if (this.modalContenido.tipo === 'Retardos') {
        this.ExplosivosUniService.createExplosivo(nuevoRegistro).subscribe({ next: onSuccess, error: (e) => console.error('Error al guardar retardo:', e) });
      } else if (this.modalContenido.tipo === 'Numeros retardos') {
        this.numeroRetardosService.create(nuevoRegistro).subscribe({ next: onSuccess, error: (e) => console.error('Error al guardar número retardo:', e) });
      }
    }
  }

  eliminar(item: any): void {
    if (!item || !this.modalContenido) return;

    const quitarDeTabla = () => {
      this.categoriaActiva.datos = this.categoriaActiva.datos.filter((d: any) => d.id !== item.id);
      this.refrescarTabla();
    };

    if (this.modalContenido.tipo === 'explosivo') {
      this.explosivoService.deleteExplosivo(item.id).subscribe({ next: quitarDeTabla, error: (e) => console.error('Error al eliminar explosivo:', e) });
    } else if (this.modalContenido.tipo === 'accesorio') {
      this.accesorioService.deleteAccesorio(item.id).subscribe({ next: quitarDeTabla, error: (e) => console.error('Error al eliminar accesorio:', e) });
    } else if (this.modalContenido.tipo === 'Retardos') {
      this.ExplosivosUniService.deleteExplosivo(item.id).subscribe({ next: quitarDeTabla, error: (e) => console.error('Error al eliminar retardo:', e) });
    } else if (this.modalContenido.tipo === 'Numeros retardos') {
      this.numeroRetardosService.delete(item.id).subscribe({ next: quitarDeTabla, error: (e) => console.error('Error al eliminar número retardo:', e) });
    }
  }

  descargar(item: any): void {}

  // ── Definición de categorías ──

  buttonc = [
    {
      nombre: 'Explosivos',
      icon: 'mas.svg',
      tipo: 'explosivo',
      datos: [] as any[],
      campos: [
        { nombre: 'codigo',            label: 'Código',            tipo: 'text' },
        { nombre: 'tipo_explosivo',    label: 'Tipo de Explosivo', tipo: 'text' },
        { nombre: 'cantidad_por_caja', label: 'Cantidad por Caja', tipo: 'number' },
        { nombre: 'peso_unitario',     label: 'Peso Unitario',     tipo: 'number' },
        { nombre: 'costo_por_kg',      label: 'Costo por KG',      tipo: 'number' },
        { nombre: 'unidad_medida',     label: 'Unidad de Medida',  tipo: 'select',
          opciones: ['kg', 'unidad', 'litros', 'metros'] },
      ],
    },
    {
      nombre: 'Accesorios',
      icon: 'mas.svg',
      tipo: 'accesorio',
      datos: [] as any[],
      campos: [
        { nombre: 'codigo',         label: 'Código',            tipo: 'text' },
        { nombre: 'tipo_accesorio', label: 'Tipo de Accesorio', tipo: 'text' },
        { nombre: 'costo',          label: 'Costo',             tipo: 'number' },
        { nombre: 'unidad_medida',  label: 'Unidad de Medida',  tipo: 'select',
          opciones: ['kg', 'unidad', 'litros', 'metros'] },
      ],
    },
    {
      nombre: 'Retardos',
      icon: 'mas.svg',
      tipo: 'Retardos',
      datos: [] as any[],
      campos: [
        { nombre: 'dato', label: 'Dato', tipo: 'number' },
        { nombre: 'tipo', label: 'Tipo', tipo: 'select',
          opciones: ['Milisegundo', 'Medio Segundo'] },
      ],
    },
    {
      nombre: 'Números Retardos',
      icon: 'mas.svg',
      tipo: 'Numeros retardos',
      datos: [] as any[],
      campos: [
        { nombre: 'codigo',      label: 'Código',      tipo: 'text' },
        { nombre: 'longitud',    label: 'Longitud',    tipo: 'number' },
        { nombre: 'tipo',        label: 'Tipo',        tipo: 'text' },
        { nombre: 'enumeracion', label: 'Enumeración', tipo: 'number' },
      ],
    },
  ];
}
