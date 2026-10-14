import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { PresentacionMmtoComponent, PresentacionMmtoData } from './presentacion-mmto.component';
import { PresentacionMmtoHzComponent } from '../../horizontal/presentacion-mmto-hz/presentacion-mmto-hz.component';
import { PresentacionMmtoScalaminComponent } from '../../Scalamin/presentacion-mmto-scalamin/presentacion-mmto-scalamin.component';
import { PresentacionMmtoScoopComponent } from '../../scoops/presentacion-mmto-scoop/presentacion-mmto-scoop.component';
import { PresentacionMmtoEmpernadorComponent } from '../../sostenimiento/presentacion-mmto-empernador/presentacion-mmto-empernador.component';
import { duracionSegundos } from './tiempo-mmto';

for (const ComponentClass of [PresentacionMmtoHzComponent, PresentacionMmtoScalaminComponent, PresentacionMmtoScoopComponent, PresentacionMmtoEmpernadorComponent]) {
  describe(ComponentClass.name, () => {
    it('abre la vista compartida con el proceso y los controles de cada diálogo', async () => {
      await TestBed.configureTestingModule({
        imports: [ComponentClass],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: { operaciones: [], proceso: 'Proceso de prueba' } },
          { provide: MatDialogRef, useValue: { close: () => {} } },
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(ComponentClass);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Proceso de prueba');
      expect(fixture.nativeElement.querySelector('select')).not.toBeNull();
      expect(fixture.nativeElement.textContent).toContain('No hay registros');
      fixture.destroy();
    });
    it('filtra 200–299, conserva observaciones y calcula los totales nocturnos y pendientes', () => {
      const data: PresentacionMmtoData = { operaciones: ['E-1', 'E-2'].map(equipo => ({
        n_equipo: equipo, equipo, fecha: '2026-10-14', turno: 'NOCHE', operador: '', jefe_guardia: '',
        registros: ['199', '200', '299', '300', '2000'].map((codigo, id) => ({
          id, numero: id, codigo, estado: 'MANTENIMIENTO', hora_inicio: '23:30',
          hora_final: codigo === '299' ? null : '01:00',
          operacion: { observaciones: `Observación ${equipo} ${codigo}` },
        })),
      })) };
      const component = new ComponentClass(data, {} as MatDialogRef<PresentacionMmtoComponent>);
      component.dialogContainer = { nativeElement: document.createElement('div') };
      component.ngOnInit();
      try {
        expect(component.cantidadRegistros).toBe(4);
        expect(component.totalSegundos).toBe(10800);
        expect(component.totalPendientes).toBe(2);
        expect(component.grupos[0].filas[0].observaciones).toBe('Observación E-1 200');
        component.equipoSeleccionado = 'E-2';
        component.aplicarFiltro();
        expect(component.cantidadRegistros).toBe(2);
        expect(component.totalSegundos).toBe(5400);
        expect(component.totalPendientes).toBe(1);
        component.limpiarFiltro();
        expect(component.cantidadRegistros).toBe(4);
      } finally { component.ngOnDestroy(); }
    });
  });
}

describe('Horarios MMTO', () => {
  it('distingue cero de horarios inválidos y conserva segundos', () => {
    expect(duracionSegundos('08:00', '08:00')).toBe(0);
    expect(duracionSegundos('08:00:30', '08:01:15')).toBe(45);
    expect(duracionSegundos('24:00', '09:00')).toBeNull();
    expect(duracionSegundos('08:00', null)).toBeNull();
  });
});
