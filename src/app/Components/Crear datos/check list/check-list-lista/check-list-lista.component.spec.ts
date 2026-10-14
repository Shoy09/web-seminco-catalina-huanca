
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CheckListListaComponent } from './check-list-lista.component';
import { CheckListItemService } from '../../../../services/checklist-item.service';
import { EquipoService } from '../../../../services/equipo.service';

describe('Checklist por equipos: listado', () => {
  async function crear() {
    await TestBed.configureTestingModule({
      imports: [CheckListListaComponent],
      providers: [
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: EquipoService, useValue: { getEquipos: () => of([
          { id: 1, nombre: 'Jumbo', codigo: 'J-01', proceso: 'PERFORACIÓN HORIZONTAL' },
          { id: 2, nombre: 'Jumbo', codigo: 'J-02', proceso: 'PERFORACIÓN HORIZONTAL' },
        ]) } },
        { provide: CheckListItemService, useValue: {
          getItemsActualizados: () => of(false),
          getCheckListItems: () => of([
            { id: 1, proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'General', aplica_todos_equipos: true, equipo_ids: [] },
            { id: 2, proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'Específico', aplica_todos_equipos: false, equipo_ids: [2] },
          ]),
        } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CheckListListaComponent); fixture.detectChanges(); return fixture;
  }
  it('filtra por equipo e incluye los ítems generales de su proceso', async () => {
    const fixture = await crear(), component = fixture.componentInstance;
    component.equipoSeleccionado = 1; component.filtrar();
    expect(component.dataSource.filteredData.map(i => i.id)).toEqual([1]);
    component.equipoSeleccionado = 2; component.filtrar();
    expect(component.dataSource.filteredData.map(i => i.id)).toEqual([1, 2]);
  });
  it('busca los equipos por código aunque tengan el mismo nombre', async () => {
    const fixture = await crear(), component = fixture.componentInstance;
    component.busqueda = 'j-02'; component.filtrar();
    expect(component.dataSource.filteredData.map(i => i.id)).toEqual([2]);
    expect(component.descripcionEquipos(component.dataSource.data[1])).toBe('J-02 · Jumbo');
  });
});
