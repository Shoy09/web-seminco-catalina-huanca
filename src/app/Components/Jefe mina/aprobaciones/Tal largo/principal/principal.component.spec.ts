import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { PrincipalTalLargoComponent } from './principal.component';
import { OperacionesService } from 'app/services/operaciones.service';
import { EquipoService } from 'app/services/equipo.service';
import { SeccionService } from 'app/services/seccion.service';
import { UsuarioService } from 'app/services/usuario.service';
import { NotificacionesUiService } from 'app/services/notificaciones-ui.service';
import { MenuAccionesComponent } from '../menuAcciones/menuAcciones.component';

const operacionPrueba = {
  id: 23, fecha: '2026-10-18', turno: 'DÍA', equipo: 'Jumbo', n_equipo: 'TL1', modelo_equipo: 'SIMBA', operador: 'Operador de prueba', jefe_guardia: 'Jefe de prueba', seccion: 'A', revisado: 0, aprobacion: 0,
  horometros: JSON.stringify({ diesel: { inicio: 100, final: 104 }, electrico: { inicio: 50, final: 54 }, percusion: { inicio: 10, final: 12 } }),
  condiciones_equipo: JSON.stringify({ aceiteMotor: true, aceiteHidraulico: true, aceiteTransmision: true, op: true }), check_list: '[]', control_llantas: '{}',
  registros: [{ id: 1, numero: 1, estado: 'OPERATIVO', codigo: '104', hora_inicio: '07:00', hora_final: '08:00', operacion: { labor: 'L1', observaciones: '', barras: [] } }],
};

describe('Aprobaciones de taladros largos', () => {
  let fixture: ComponentFixture<PrincipalTalLargoComponent>;
  let component: PrincipalTalLargoComponent;
  let respuesta: Subject<any>;
  let operaciones: jasmine.SpyObj<OperacionesService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  beforeEach(async () => {
    respuesta = new Subject();
    operaciones = jasmine.createSpyObj('OperacionesService', ['getById', 'actualizar']);
    operaciones.getById.and.returnValue(respuesta);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialog.open.and.returnValue({ afterClosed: () => of(null) } as any);
    await TestBed.configureTestingModule({ imports: [PrincipalTalLargoComponent], providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '23' }) } } },
      { provide: OperacionesService, useValue: operaciones },
      { provide: MatDialog, useValue: dialog },
      { provide: EquipoService, useValue: { getEquiposByProceso: () => of([]) } },
      { provide: SeccionService, useValue: { getSeccionesByProceso: () => of([]) } },
      { provide: UsuarioService, useValue: { obtenerJefesGuardia: () => of([]) } },
      { provide: NotificacionesUiService, useValue: { success: () => {}, warning: () => {}, error: () => {} } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(PrincipalTalLargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  function cargar() { respuesta.next({ ok: true, data: structuredClone(operacionPrueba) }); fixture.detectChanges(); }
  it('muestra carga y luego los ocho campos y actividades reales del registro', async () => {
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
    cargar(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.operation-field').length).toBe(8);
    expect(fixture.nativeElement.querySelectorAll('.activities-table tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('#tl-codigo').value).toBe('TL1');
    expect(fixture.nativeElement.querySelector('.page-header')).toBeNull();
  });
  it('mantiene la edición de datos y no guarda si se cancela la confirmación', async () => {
    cargar(); await fixture.whenStable();
    const operador = fixture.nativeElement.querySelector('#tl-operador');
    operador.value = 'Operador corregido'; operador.dispatchEvent(new Event('input'));
    await fixture.whenStable(); fixture.detectChanges();
    expect(component.cardData.operador).toBe('Operador corregido');
    fixture.nativeElement.querySelector('.submit-review').click();
    expect(dialog.open).toHaveBeenCalled();
    expect(operaciones.actualizar).not.toHaveBeenCalled();
  });
  it('abre las herramientas de horómetros sin actualizar la operación', () => {
    cargar();
    fixture.nativeElement.querySelector('.tools-buttons button').click(); fixture.detectChanges();
    const herramientas = fixture.debugElement.query(By.directive(MenuAccionesComponent)).componentInstance as MenuAccionesComponent;
    expect(herramientas.mostrarModalHorometro).toBeTrue();
    expect(operaciones.actualizar).not.toHaveBeenCalled();
  });
  it('ofrece reintentar si falla la carga del registro', () => {
    respuesta.error({ status: 500 }); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    operaciones.getById.and.returnValue(of({ ok: true, data: structuredClone(operacionPrueba) }));
    fixture.nativeElement.querySelector('.error-panel button').click(); fixture.detectChanges();
    expect(component.errorCarga).toBe('');
    expect(fixture.nativeElement.querySelector('app-tabla')).toBeTruthy();
  });
});
