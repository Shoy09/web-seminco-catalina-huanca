import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { CheckListItemService } from '../../../../services/checklist-item.service';
import { EquipoService } from '../../../../services/equipo.service';
import { CheckListItem } from '../../../../models/checklist-item.model';
import { Equipo } from '../../../../models/equipo.model';
import { categoriasChecklist, FilaIngresoChecklist, leerFilasChecklist, normalizarChecklist, PROCESOS_CHECKLIST } from '../checklist-utils';

export interface CheckListFormData {
  proceso?: string;
  categorias?: string[];
  item?: CheckListItem;
  modo?: 'manual' | 'excel';
}

@Component({
  selector: 'app-check-list-from',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './check-list-from.component.html',
  styleUrl: './check-list-from.component.css',
})
export class CheckListFromComponent implements OnInit {
  checkListForm: FormGroup;
  procesos = [...PROCESOS_CHECKLIST];
  equipos: Equipo[] = [];
  equipoIds = new Set<number>();
  busquedaEquipo = '';
  cargandoEquipos = false;
  errorEquipos = '';
  mensaje = '';
  guardando = false;
  leyendoArchivo = false;
  modo: 'manual' | 'excel';
  filasExcel: FilaIngresoChecklist[] = [];
  erroresArchivo: string[] = [];
  archivoNombre = '';
  progreso = 0;
  totalGuardar = 0;
  private creados = 0;
  private destroyRef = inject(DestroyRef);

  constructor(
    fb: FormBuilder,
    private checkListService: CheckListItemService,
    private equipoService: EquipoService,
    public dialogRef: MatDialogRef<CheckListFromComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CheckListFormData,
  ) {
    const item = data.item;
    this.modo = item ? 'manual' : data.modo ?? 'manual';
    this.checkListForm = fb.group({
      proceso: [item?.proceso ?? data.proceso ?? '', [Validators.required, Validators.maxLength(255)]],
      categoria: [item?.categoria ?? '', Validators.required],
      nombre: [item?.nombre ?? '', Validators.required],
      todos: [item ? item.aplica_todos_equipos !== false : false],
    });
    this.equipoIds = new Set(item?.equipo_ids ?? item?.equipos?.map(e => e.id) ?? []);
    const proceso = this.checkListForm.value.proceso;
    if (proceso && !this.procesos.includes(proceso)) this.procesos.push(proceso);
  }

  ngOnInit(): void { this.cargarEquipos(); }
  get editando(): boolean { return this.data.item?.id !== undefined; }
  get proceso(): string { return this.checkListForm.get('proceso')?.value ?? ''; }
  get todos(): boolean { return this.checkListForm.get('todos')?.value === true; }
  get categorias(): string[] {
    const categorias = categoriasChecklist(this.proceso);
    const actual = this.data.item?.categoria;
    return actual && !categorias.includes(actual) ? [...categorias, actual] : categorias;
  }
  get equiposProceso(): Equipo[] {
    return this.equipos.filter(e => e.id !== undefined && normalizarChecklist(e.proceso) === normalizarChecklist(this.proceso));
  }
  get equiposVisibles(): Equipo[] {
    const query = normalizarChecklist(this.busquedaEquipo);
    return this.equiposProceso.filter(e => normalizarChecklist(`${e.codigo ?? ''} ${e.nombre ?? ''} ${e.modelo ?? ''}`).includes(query));
  }
  get filasManuales(): FilaIngresoChecklist[] {
    const nombres = String(this.checkListForm.get('nombre')?.value ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return nombres.map(nombre => ({ categoria: this.checkListForm.get('categoria')?.value ?? '', nombre }));
  }
  get filas(): FilaIngresoChecklist[] { return this.modo === 'excel' ? this.filasExcel : this.filasManuales; }
  get errorNombres(): string {
    const filas = this.filasManuales;
    if (filas.some(f => f.nombre.length > 255)) return 'Cada nombre admite hasta 255 caracteres.';
    if (this.editando && filas.length > 1) return 'Al editar solo puedes guardar un ítem.';
    if (new Set(filas.map(f => normalizarChecklist(f.nombre))).size !== filas.length) return 'Hay nombres repetidos. Revisa las líneas antes de guardar.';
    return '';
  }
  get seleccionValida(): boolean {
    return !!this.proceso && (this.todos || (!this.cargandoEquipos && !this.errorEquipos && this.equipoIds.size > 0
      && [...this.equipoIds].every(id => this.equiposProceso.some(e => e.id === id))));
  }
  get puedeGuardar(): boolean {
    return !this.guardando && !this.leyendoArchivo && this.seleccionValida && this.filas.length > 0
      && (this.modo === 'excel' ? !this.erroresArchivo.length : !!this.checkListForm.get('categoria')?.valid && !this.errorNombres);
  }

  cargarEquipos(): void {
    this.cargandoEquipos = true;
    this.errorEquipos = '';
    this.equipoService.getEquipos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: equipos => {
        this.equipos = equipos;
        for (const equipo of equipos) {
          if (equipo.proceso && !this.procesos.some(p => normalizarChecklist(p) === normalizarChecklist(equipo.proceso))) this.procesos.push(equipo.proceso);
        }
        this.cargandoEquipos = false;
      },
      error: () => { this.cargandoEquipos = false; this.errorEquipos = 'No se pudieron cargar los equipos. Intenta nuevamente.'; },
    });
  }

  cambiarProceso(): void {
    this.equipoIds.clear();
    this.busquedaEquipo = '';
    this.checkListForm.patchValue({ categoria: '', todos: false });
    this.filasExcel = [];
    this.erroresArchivo = [];
    this.archivoNombre = '';
    this.mensaje = '';
  }
  cambiarModo(modo: 'manual' | 'excel'): void {
    if (!this.guardando && !this.editando) { this.modo = modo; this.mensaje = ''; }
  }
  marcarEquipo(id: number | undefined, checked: boolean): void {
    if (id === undefined || this.guardando) return;
    if (checked) this.equipoIds.add(id); else this.equipoIds.delete(id);
  }
  seleccionarVisibles(): void { this.equiposVisibles.forEach(e => this.equipoIds.add(e.id!)); }

  async cargarArchivo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.guardando) return;
    this.filasExcel = []; this.erroresArchivo = []; this.archivoNombre = file.name; this.mensaje = '';
    if (!/\.xlsx?$/i.test(file.name)) { this.erroresArchivo = ['Selecciona un archivo .xls o .xlsx.']; return; }
    this.leyendoArchivo = true;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error('No hay hojas');
      const resultado = leerFilasChecklist(XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' }), this.categorias);
      this.filasExcel = resultado.filas; this.erroresArchivo = resultado.errores;
    } catch { this.erroresArchivo = ['No se pudo leer el archivo Excel. Revisa su contenido e intenta nuevamente.']; }
    finally { this.leyendoArchivo = false; }
  }

  descargarPlantilla(): void {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ['Categoria', 'Nombre'], [this.categorias[0], 'Verificar nivel de aceite'],
    ]), 'Checklist');
    XLSX.writeFile(workbook, 'plantilla-checklist.xlsx');
  }

  async onSubmit(): Promise<void> {
    if (!this.puedeGuardar) { this.checkListForm.markAllAsTouched(); return; }
    this.guardando = true; this.dialogRef.disableClose = true; this.mensaje = '';
    const filas = this.filas.map(f => ({ ...f }));
    const alcance = { proceso: this.proceso, aplica_todos_equipos: this.todos, equipo_ids: this.todos ? [] : [...this.equipoIds] };
    this.totalGuardar = filas.length; this.progreso = 0;
    const fallidos: FilaIngresoChecklist[] = [];
    let guardados = 0, errorMensaje = '';
    for (const fila of filas) {
      const payload: CheckListItem = { ...alcance, ...fila };
      try {
        if (this.editando) await firstValueFrom(this.checkListService.updateCheckListItem(this.data.item!.id!, payload));
        else await firstValueFrom(this.checkListService.createCheckListItem(payload, false));
        guardados++;
      } catch (error: unknown) {
        fallidos.push(fila);
        const message = (error as { error?: { error?: unknown } })?.error?.error;
        errorMensaje = typeof message === 'string' ? message : 'Revisa la conexión e intenta nuevamente.';
      }
      this.progreso++;
    }
    this.creados += guardados;
    if (guardados && !this.editando) this.checkListService.notificarActualizacion();
    this.guardando = false; this.dialogRef.disableClose = false;
    if (!fallidos.length) { this.dialogRef.close({ guardados: this.creados }); return; }
    if (this.modo === 'excel') this.filasExcel = fallidos;
    else this.checkListForm.patchValue({ nombre: fallidos.map(f => f.nombre).join('\n') });
    this.mensaje = `${guardados} guardados; ${fallidos.length} pendientes. ${errorMensaje} Al reintentar se enviarán solo los pendientes.`;
  }

  onCancel(): void { if (!this.guardando) this.dialogRef.close(this.creados ? { guardados: this.creados } : undefined); }
}
