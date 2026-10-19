import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { OperacionesService } from 'app/services/operaciones.service';
import { EquipoService } from 'app/services/equipo.service';
import { SeccionService } from 'app/services/seccion.service';
import { UsuarioService } from 'app/services/usuario.service';
import { NotificacionesUiService } from 'app/services/notificaciones-ui.service';
import { PrincipalSostenimientoComponent } from '../enpernador/principal/principal.component';
import { PrincipalScalaminComponent } from '../scalamin/principal/principal.component';
import { PrincipalScissorComponent } from '../scissor/principal/principal.component';
import { PrincipalScoopsComponent } from '../Scoop/principal/principal.component';
import { PrincipalTalHorizontalComponent } from '../Tal horizontal/principal/principal.component';

const casos: { nombre: string; componente: Type<any>; campos: number; acciones: number }[] = [
  { nombre: 'Sostenimiento', componente: PrincipalSostenimientoComponent, campos: 8, acciones: 2 },
  { nombre: 'Scalamin', componente: PrincipalScalaminComponent, campos: 7, acciones: 2 },
  { nombre: 'Scissor', componente: PrincipalScissorComponent, campos: 6, acciones: 5 },
  { nombre: 'Scoop', componente: PrincipalScoopsComponent, campos: 9, acciones: 6 },
  { nombre: 'Tal horizontal', componente: PrincipalTalHorizontalComponent, campos: 8, acciones: 5 },
];
const datos = {
  id: 23, fecha: '2026-10-18', turno: 'DÍA', equipo: 'Equipo de prueba', n_equipo: 'EQ1', modelo_equipo: 'Modelo', capacidad: '4.2', tipo_equipo: 'diesel', operador: 'Operador de prueba', jefe_guardia: 'Jefe de prueba', seccion: 'A', guardia: 'B', revisado: 0, aprobacion: 0,
  horometros: JSON.stringify({ diesel: { inicio: 10, final: 12 }, electrico: { inicio: 20, final: 22 }, percusion: { inicio: 30, final: 32 }, empernador: { inicio: 40, final: 42 } }),
  condiciones_equipo: JSON.stringify({ aceiteMotor: true, aceiteHidraulico: true, aceiteTransmision: true, op: true }), check_list: '[]', control_llantas: '{}', programa_trabajo: '{"n_cucharas_programado":10,"n_cucharas_realizado":8}',
  registros: [{ id: 1, numero: 1, estado: 'OPERATIVO', codigo: '101', hora_inicio: '07:00', hora_final: '08:00', operacion: { labor: 'L1', observaciones: '', barras: [], perno: [], malla: [], perforacion: [] } }],
};
for (const caso of casos) {
  describe(`Diseño compacto de aprobaciones: ${caso.nombre}`, () => {
    let fixture: ComponentFixture<any>;
    let respuesta: Subject<any>;
    let operaciones: jasmine.SpyObj<OperacionesService>;
    beforeEach(async () => {
      respuesta = new Subject();
      operaciones = jasmine.createSpyObj('OperacionesService', ['getById', 'actualizar']);
      operaciones.getById.and.returnValue(respuesta);
      await TestBed.configureTestingModule({ imports: [caso.componente], providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '23' }) } } },
        { provide: OperacionesService, useValue: operaciones },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: EquipoService, useValue: { getEquiposByProceso: () => of([]) } },
        { provide: SeccionService, useValue: { getSeccionesByProceso: () => of([]) } },
        { provide: UsuarioService, useValue: { obtenerJefesGuardia: () => of([]) } },
        { provide: NotificacionesUiService, useValue: { success: () => {}, warning: () => {}, error: () => {} } },
      ] }).compileComponents();
      fixture = TestBed.createComponent(caso.componente); fixture.detectChanges();
    });
    async function cargar() { respuesta.next({ ok: true, data: structuredClone(datos) }); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); }
    it('conserva sus campos propios y empieza directamente con los datos', async () => {
      await cargar();
      expect(fixture.nativeElement.querySelector('.page-header')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.operation-field').length).toBe(caso.campos);
      expect(fixture.nativeElement.querySelector('#revision-codigo').value).toBe('EQ1');
      if (caso.nombre === 'Scalamin') expect(fixture.nativeElement.querySelector('#revision-guardia').value).toBe('B');
      if (caso.nombre === 'Scoop') expect(fixture.nativeElement.querySelector('#revision-capacidad').value).toBe('4.2');
      if (caso.nombre === 'Sostenimiento' || caso.nombre === 'Scoop') expect(fixture.nativeElement.querySelector('.equipment-options input').checked).toBeTrue();
    });
    it('mantiene la edición del operador y abre el detalle propio de la actividad', async () => {
      await cargar();
      const operador = fixture.nativeElement.querySelector('#revision-operador');
      operador.value = 'Operador corregido'; operador.dispatchEvent(new Event('input')); await fixture.whenStable(); fixture.detectChanges();
      expect(fixture.componentInstance.cardData.operador).toBe('Operador corregido');
      fixture.nativeElement.querySelector('.detail-action').click(); fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-formulario-perforacion').textContent.trim().length).toBeGreaterThan(0);
      expect(operaciones.actualizar).not.toHaveBeenCalled();
    });
    it('conserva las herramientas habilitadas y conecta el botón de revisión', async () => {
      await cargar();
      expect(fixture.nativeElement.querySelectorAll('.tools-buttons button').length).toBe(caso.acciones);
      const confirmar = spyOn(fixture.componentInstance, 'validarCambios').and.stub();
      fixture.nativeElement.querySelector('.submit-review').click();
      expect(confirmar).toHaveBeenCalledTimes(1);
      if (caso.nombre === 'Scoop') expect(fixture.nativeElement.querySelector('app-menuAcciones').textContent).toContain('Programa de trabajo');
    });
    it('permite reintentar cuando falla la carga', () => {
      respuesta.error({ status: 500 }); fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
      operaciones.getById.and.returnValue(of({ ok: true, data: structuredClone(datos) }));
      fixture.nativeElement.querySelector('.error-panel button').click(); fixture.detectChanges();
      expect(fixture.componentInstance.errorCarga).toBe('');
      expect(fixture.nativeElement.querySelector('.activities-table')).toBeTruthy();
    });
  });
}
