
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CheckListFromComponent, CheckListFormData } from './check-list-from.component';
import { CheckListItemService } from '../../../../services/checklist-item.service';
import { EquipoService } from '../../../../services/equipo.service';
import { Equipo } from '../../../../models/equipo.model';

describe('Checklist por equipos: formulario', () => {
  let fixture: ComponentFixture<CheckListFromComponent>;
  let component: CheckListFromComponent;
  let api: jasmine.SpyObj<CheckListItemService>;
  let equipoApi: jasmine.SpyObj<EquipoService>;
  let dialog: { close: jasmine.Spy; disableClose: boolean };
  const equipos = [
    { id: 1, nombre: 'Jumbo', codigo: 'J-01', proceso: 'PERFORACIÓN HORIZONTAL' },
    { id: 2, nombre: 'Jumbo', codigo: 'J-02', proceso: 'PERFORACIÓN HORIZONTAL' },
    { id: 3, nombre: 'Jumbo', codigo: 'S-01', proceso: 'SCALAMIN' },
  ] as Equipo[];

  async function configurar(data: CheckListFormData = {}): Promise<void> {
    api = jasmine.createSpyObj('Checklist', ['createCheckListItem', 'updateCheckListItem', 'notificarActualizacion']);
    api.createCheckListItem.and.returnValue(of({ proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'Aceite' }));
    api.updateCheckListItem.and.returnValue(of({ proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'Aceite' }));
    equipoApi = jasmine.createSpyObj('Equipos', ['getEquipos']);
    equipoApi.getEquipos.and.returnValue(of(equipos));
    dialog = { close: jasmine.createSpy('close'), disableClose: false };
    await TestBed.configureTestingModule({
      imports: [CheckListFromComponent],
      providers: [
        { provide: CheckListItemService, useValue: api }, { provide: EquipoService, useValue: equipoApi },
        { provide: MatDialogRef, useValue: dialog }, { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckListFromComponent); component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function completar(): void {
    component.checkListForm.patchValue({ proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'Aceite\nFrenos' });
    component.marcarEquipo(1, true); component.marcarEquipo(2, true);
  }

  it('distingue equipos con el mismo nombre y guarda sus IDs en cada ítem', async () => {
    await configurar(); completar(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('J-01'); expect(fixture.nativeElement.textContent).toContain('J-02');
    expect(component.equiposProceso.length).toBe(2);
    await component.onSubmit();
    expect(api.createCheckListItem.calls.count()).toBe(2);
    expect(api.createCheckListItem.calls.argsFor(0)[0]).toEqual({ proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'Aceite', aplica_todos_equipos: false, equipo_ids: [1, 2] });
    expect(api.notificarActualizacion.calls.count()).toBe(1);
    expect(dialog.close).toHaveBeenCalledWith({ guardados: 2 });
  });

  it('exige un equipo y rechaza IDs ajenos al proceso', async () => {
    await configurar(); completar(); component.equipoIds.clear();
    expect(component.puedeGuardar).toBeFalse();
    component.marcarEquipo(3, true); expect(component.puedeGuardar).toBeFalse();
    await component.onSubmit(); expect(api.createCheckListItem).not.toHaveBeenCalled();
  });

  it('envía el alcance general explícito sin IDs', async () => {
    await configurar(); completar(); component.checkListForm.patchValue({ todos: true });
    await component.onSubmit();
    expect(api.createCheckListItem.calls.argsFor(0)[0].equipo_ids).toEqual([]);
    expect(api.createCheckListItem.calls.argsFor(0)[0].aplica_todos_equipos).toBeTrue();
  });

  it('limpia la asignación y la categoría al cambiar de proceso', async () => {
    await configurar(); completar(); component.checkListForm.patchValue({ proceso: 'SCALAMIN' }); component.cambiarProceso();
    expect(component.equipoIds.size).toBe(0); expect(component.checkListForm.value.categoria).toBe('');
    expect(component.equiposProceso.map(e => e.id)).toEqual([3]);
  });

  it('carga y actualiza un ítem específico con su asignación', async () => {
    await configurar({ item: { id: 9, proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'Aceite', aplica_todos_equipos: false, equipo_ids: [2] } });
    expect(component.todos).toBeFalse(); expect([...component.equipoIds]).toEqual([2]);
    await component.onSubmit();
    expect(api.updateCheckListItem).toHaveBeenCalledWith(9, { proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'ANTES', nombre: 'Aceite', aplica_todos_equipos: false, equipo_ids: [2] });
    expect(api.createCheckListItem).not.toHaveBeenCalled();
  });

  it('reintenta únicamente los ítems fallidos después de un guardado parcial', async () => {
    await configurar(); completar();
    api.createCheckListItem.and.callFake(item => item.nombre === 'Frenos' ? throwError(() => ({ error: { error: 'Fallo de prueba' } })) : of(item));
    await component.onSubmit();
    expect(component.checkListForm.value.nombre).toBe('Frenos'); expect(dialog.close).not.toHaveBeenCalled(); expect(component.guardando).toBeFalse();
    api.createCheckListItem.and.callFake(item => of(item));
    await component.onSubmit();
    expect(api.createCheckListItem.calls.count()).toBe(3); expect(api.createCheckListItem.calls.argsFor(2)[0].nombre).toBe('Frenos');
    expect(dialog.close).toHaveBeenCalledWith({ guardados: 2 });
  });

  it('Excel utiliza las mismas asignaciones y bloquea archivos con errores', async () => {
    await configurar({ modo: 'excel' }); completar();
    component.filasExcel = [{ categoria: 'MPI', nombre: 'Filtros' }]; component.erroresArchivo = ['Fila inválida'];
    expect(component.puedeGuardar).toBeFalse(); component.erroresArchivo = [];
    await component.onSubmit();
    expect(api.createCheckListItem.calls.argsFor(0)[0]).toEqual({ proceso: 'PERFORACIÓN HORIZONTAL', categoria: 'MPI', nombre: 'Filtros', aplica_todos_equipos: false, equipo_ids: [1, 2] });
  });

  it('rechaza nombres repetidos y espacios vacíos', async () => {
    await configurar(); completar(); component.checkListForm.patchValue({ nombre: 'Aceite\n aceite ' });
    expect(component.puedeGuardar).toBeFalse(); component.checkListForm.patchValue({ nombre: '   \n  ' });
    expect(component.puedeGuardar).toBeFalse();
  });
});
