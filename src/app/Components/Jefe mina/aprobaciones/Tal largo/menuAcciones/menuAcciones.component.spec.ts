import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuAccionesComponent } from './menuAcciones.component';

describe('Horómetros de Tal largo', () => {
  let fixture: ComponentFixture<MenuAccionesComponent>;
  let component: MenuAccionesComponent;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MenuAccionesComponent] }).compileComponents();
    fixture = TestBed.createComponent(MenuAccionesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('horometrosData', {
      diesel: { inicio: 100.25, final: 104.75, op: true, inop: false },
      electrico: { inicio: 50, final: 52, op: true, inop: false },
      percusion: { inicio: 2066.33, final: 0, op: true, inop: false },
    });
    fixture.detectChanges();
    component.seleccionarAccion('horometro'); fixture.detectChanges();
    await fixture.whenStable();
  });
  it('muestra los tres sistemas y conserva las diferencias negativas', () => {
    expect(fixture.nativeElement.querySelectorAll('.meter-table tbody tr').length).toBe(3);
    expect(component.diferenciaHorometro(component.filasHorometro[0])).toBe(4.5);
    expect(component.diferenciaHorometro(component.filasHorometro[2])).toBe(-2066.33);
    expect(fixture.nativeElement.querySelectorAll('.meter-difference.is-negative').length).toBe(1);
    expect(component.diferenciaHorometro({ inicial: null, final: 4 })).toBeNull();
  });
  it('actualiza la diferencia al editar y guarda sin redondear las lecturas', async () => {
    const emitido = spyOn(component.dataChange, 'emit');
    const final = fixture.nativeElement.querySelector('#meter-final-0');
    final.value = '105.1234'; final.dispatchEvent(new Event('input'));
    await fixture.whenStable(); fixture.detectChanges();
    expect(component.diferenciaHorometro(component.filasHorometro[0])).toBeCloseTo(4.8734, 4);
    fixture.nativeElement.querySelector('.meter-save').click();
    expect(emitido).toHaveBeenCalledWith({ tipo: 'horometros', data: {
      diesel: { inicio: 100.25, final: 105.1234, op: 1, inop: 0 },
      electrico: { inicio: 50, final: 52, op: 1, inop: 0 },
      percusion: { inicio: 2066.33, final: 0, op: 1, inop: 0 },
    } });
    expect(component.mostrarModalHorometro).toBeFalse();
  });
  it('mantiene OP e INOP excluyentes y accesibles', () => {
    fixture.nativeElement.querySelectorAll('.meter-state-options button')[1].click(); fixture.detectChanges();
    expect(component.filasHorometro[0].op).toBeFalse();
    expect(component.filasHorometro[0].inop).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('.meter-state-options button')[1].getAttribute('aria-pressed')).toBe('true');
  });
  it('descarta las ediciones al cancelar y reabre las lecturas guardadas', () => {
    const emitido = spyOn(component.dataChange, 'emit');
    component.filasHorometro[0].final = 999;
    fixture.nativeElement.querySelector('.meter-cancel').click(); fixture.detectChanges();
    expect(emitido).not.toHaveBeenCalled();
    component.seleccionarAccion('horometro'); fixture.detectChanges();
    expect(component.filasHorometro[0].final).toBe(104.75);
  });
  it('permite cerrar con Escape sin guardar', () => {
    const emitido = spyOn(component.dataChange, 'emit');
    fixture.nativeElement.querySelector('.meter-dialog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(component.mostrarModalHorometro).toBeFalse();
    expect(emitido).not.toHaveBeenCalled();
  });
});
