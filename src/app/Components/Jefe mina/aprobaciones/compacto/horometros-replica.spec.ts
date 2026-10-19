import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuAccionesComponent as Sostenimiento } from '../enpernador/menuAcciones/menuAcciones.component';
import { MenuAccionesComponent as Scalamin } from '../scalamin/menuAcciones/menuAcciones.component';
import { MenuAccionesComponent as Scissor } from '../scissor/menuAcciones/menuAcciones.component';
import { MenuAccionesComponent as Scoop } from '../Scoop/menuAcciones/menuAcciones.component';
import { MenuAccionesComponent as Horizontal } from '../Tal horizontal/menuAcciones/menuAcciones.component';

const casos: { nombre: string; componente: Type<any>; lecturas: string[] }[] = [
  { nombre: 'Sostenimiento', componente: Sostenimiento, lecturas: ['diesel', 'electrico', 'percusion', 'empernador'] },
  { nombre: 'Scalamin', componente: Scalamin, lecturas: ['diesel', 'percusion'] },
  { nombre: 'Scissor', componente: Scissor, lecturas: ['diesel'] },
  { nombre: 'Scoop', componente: Scoop, lecturas: ['horometro'] },
  { nombre: 'Tal horizontal', componente: Horizontal, lecturas: ['diesel', 'electrico', 'percusion'] },
];
for (const caso of casos) {
  describe(`Horómetros de ${caso.nombre}`, () => {
    let fixture: ComponentFixture<any>;
    let component: any;
    let datos: Record<string, any>;
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [caso.componente] }).compileComponents();
      fixture = TestBed.createComponent(caso.componente); component = fixture.componentInstance;
      datos = Object.fromEntries(caso.lecturas.map((key, i) => [key, {
        inicio: i === caso.lecturas.length - 1 ? 2066.33 : 100.25 + i * 100,
        final: i === caso.lecturas.length - 1 ? 0 : 104.75 + i * 100,
        op: true, inop: false,
      }]));
      fixture.componentRef.setInput('horometrosData', structuredClone(datos)); fixture.detectChanges();
      component.seleccionarAccion('horometro'); fixture.detectChanges(); await fixture.whenStable();
    });
    it('muestra exclusivamente las lecturas propias del equipo y las diferencias negativas', () => {
      expect(fixture.nativeElement.querySelectorAll('.meter-table tbody tr').length).toBe(caso.lecturas.length);
      expect(component.diferenciaHorometro(component.filasHorometro[caso.lecturas.length - 1])).toBe(-2066.33);
      expect(fixture.nativeElement.querySelectorAll('.meter-difference.is-negative').length).toBe(1);
    });
    it('guarda las claves originales y la precisión de las lecturas editadas', async () => {
      const emitido = spyOn(component.dataChange, 'emit');
      const final = fixture.nativeElement.querySelector('#meter-final-0');
      final.value = '2100.1234'; final.dispatchEvent(new Event('input'));
      await fixture.whenStable(); fixture.detectChanges();
      fixture.nativeElement.querySelector('.meter-save').click();
      const evento = emitido.calls.mostRecent().args[0] as {
        tipo: string;
        data: Record<string, { inicio: number; final: number }>;
      };
      expect(evento.tipo).toBe('horometros');
      expect(Object.keys(evento.data)).toEqual(caso.lecturas);
      expect(evento.data[caso.lecturas[0]].final).toBe(2100.1234);
      for (const key of caso.lecturas) expect(evento.data[key].inicio).toBe(datos[key].inicio);
      expect(component.mostrarModalHorometro).toBeFalse();
    });
    it('mantiene OP e INOP excluyentes', () => {
      fixture.nativeElement.querySelectorAll('.meter-state-options button')[1].click(); fixture.detectChanges();
      expect(component.filasHorometro[0].op).toBeFalse();
      expect(component.filasHorometro[0].inop).toBeTrue();
      expect(fixture.nativeElement.querySelectorAll('.meter-state-options button')[1].getAttribute('aria-pressed')).toBe('true');
    });
    it('cancelar descarta el borrador y Escape cierra sin guardar', () => {
      const emitido = spyOn(component.dataChange, 'emit');
      component.filasHorometro[0].final = 9999;
      fixture.nativeElement.querySelector('.meter-cancel').click(); fixture.detectChanges();
      component.seleccionarAccion('horometro'); fixture.detectChanges();
      expect(component.filasHorometro[0].final).toBe(datos[caso.lecturas[0]].final);
      fixture.nativeElement.querySelector('.meter-dialog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); fixture.detectChanges();
      expect(component.mostrarModalHorometro).toBeFalse();
      expect(emitido).not.toHaveBeenCalled();
    });
  });
}
