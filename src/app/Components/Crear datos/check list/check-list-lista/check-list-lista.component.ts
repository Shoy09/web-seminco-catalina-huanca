
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';
import { CheckListItem } from '../../../../models/checklist-item.model';
import { Equipo } from '../../../../models/equipo.model';
import { CheckListItemService } from '../../../../services/checklist-item.service';
import { EquipoService } from '../../../../services/equipo.service';
import { ConfirmDialogComponent } from '../../../Estado/confirm-dialog/confirm-dialog.component';
import { CheckListFromComponent } from '../check-list-from/check-list-from.component';
import { normalizarChecklist, PROCESOS_CHECKLIST } from '../checklist-utils';

@Component({
  selector: 'app-check-list-lista',
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './check-list-lista.component.html',
  styleUrl: './check-list-lista.component.css',
})
export class CheckListListaComponent implements OnInit {
  displayedColumns = ['proceso', 'equipos', 'categoria', 'nombre', 'acciones'];
  dataSource = new MatTableDataSource<CheckListItem>();
  equipos: Equipo[] = [];
  procesoSeleccionado = '';
  equipoSeleccionado = 0;
  busqueda = '';
  mensaje = '';
  errorEquipos = '';
  cargando = false;
  editandoId: number | undefined;
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) { this.dataSource.paginator = value; }

  constructor(private checkService: CheckListItemService, private equipoService: EquipoService, public dialog: MatDialog) {
    this.dataSource.filterPredicate = item => {
      if (this.procesoSeleccionado && normalizarChecklist(item.proceso) !== normalizarChecklist(this.procesoSeleccionado)) return false;
      if (this.equipoSeleccionado) {
        const equipo = this.equipos.find(e => e.id === this.equipoSeleccionado);
        if (!equipo || normalizarChecklist(equipo.proceso) !== normalizarChecklist(item.proceso)) return false;
        if (item.aplica_todos_equipos === false && !(item.equipo_ids ?? item.equipos?.map(e => e.id) ?? []).includes(this.equipoSeleccionado)) return false;
      }
      return normalizarChecklist([item.proceso, item.categoria, item.nombre, this.descripcionEquipos(item)].join(' ')).includes(normalizarChecklist(this.busqueda));
    };
  }

  ngOnInit(): void {
    this.getEstados(); this.cargarEquipos();
    this.checkService.getItemsActualizados().pipe(skip(1), takeUntilDestroyed(this.destroyRef)).subscribe(cambio => { if (cambio) this.getEstados(); });
  }

  get procesos(): string[] {
    const unicos = new Map<string, string>();
    [...PROCESOS_CHECKLIST, ...this.dataSource.data.map(i => i.proceso), ...this.equipos.map(e => e.proceso ?? '')]
      .filter(Boolean).forEach(p => unicos.set(normalizarChecklist(p), p));
    return [...unicos.values()].sort();
  }
  get equiposDisponibles(): Equipo[] {
    return this.equipos.filter(e => e.id !== undefined && (!this.procesoSeleccionado || normalizarChecklist(e.proceso) === normalizarChecklist(this.procesoSeleccionado)));
  }
  descripcionEquipos(item: CheckListItem): string {
    if (item.aplica_todos_equipos !== false) return 'Todos los equipos del proceso';
    const asignados = item.equipo_ids ?? item.equipos?.map(e => e.id) ?? [];
    if (!asignados.length) return 'Sin equipos asignados';
    return asignados.map(id => {
      const equipo = item.equipos?.find(e => e.id === id) ?? this.equipos.find(e => e.id === id);
      return equipo ? `${equipo.codigo || 'Sin código'} · ${equipo.nombre || 'Sin nombre'}` : 'Equipo no disponible';
    }).join(', ');
  }
  cargarEquipos(): void {
    this.errorEquipos = '';
    this.equipoService.getEquipos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: equipos => { this.equipos = equipos; this.filtrar(); },
      error: () => { this.errorEquipos = 'No se pudieron cargar los equipos para el filtro.'; },
    });
  }
  getEstados(): void {
    this.cargando = true; this.mensaje = '';
    this.checkService.getCheckListItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => { this.dataSource.data = items; this.cargando = false; this.filtrar(); },
      error: () => { this.cargando = false; this.mensaje = 'No se pudo cargar el checklist. Intenta nuevamente.'; },
    });
  }
  filtrar(): void {
    this.dataSource.filter = JSON.stringify([this.busqueda, this.procesoSeleccionado, this.equipoSeleccionado]);
    this.dataSource.paginator?.firstPage();
  }
  cambiarProceso(): void { this.equipoSeleccionado = 0; this.filtrar(); }
  applyFilter(event: Event): void { this.busqueda = (event.target as HTMLInputElement).value; this.filtrar(); }

  abrirFormulario(modo: 'manual' | 'excel' = 'manual'): void {
    this.dialog.open(CheckListFromComponent, {
      width: '800px', maxWidth: 'calc(100vw - 24px)', maxHeight: '90dvh', autoFocus: 'dialog',
      data: { proceso: this.procesoSeleccionado, modo },
    });
  }
  abrirSeleccionProcesoDialogo(): void { this.abrirFormulario(); }

  abrirDialogoEditar(item: CheckListItem): void {
    if (item.id === undefined || this.editandoId !== undefined) return;
    this.editandoId = item.id; this.mensaje = '';
    this.checkService.getCheckListItemById(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actual => {
        this.editandoId = undefined;
        this.dialog.open(CheckListFromComponent, {
          width: '800px', maxWidth: 'calc(100vw - 24px)', maxHeight: '90dvh', autoFocus: 'dialog', data: { item: actual },
        });
      },
      error: () => { this.editandoId = undefined; this.mensaje = 'No se pudo cargar el ítem para editarlo.'; },
    });
  }
  eliminarItem(id: number): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px', maxWidth: 'calc(100vw - 24px)',
      data: { mensaje: '¿Eliminar este ítem y sus asignaciones a equipos?' },
    }).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmado => {
      if (confirmado) this.checkService.deleteCheckListItem(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        error: () => { this.mensaje = 'No se pudo eliminar el ítem. Intenta nuevamente.'; },
      });
    });
  }
}
