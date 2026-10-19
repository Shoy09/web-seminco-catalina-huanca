import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogEstadoComponent } from './dialog-estado.component';

describe('DialogEstadoComponent', () => {
  let component: DialogEstadoComponent;
  let fixture: ComponentFixture<DialogEstadoComponent>;
  let cerrar: jasmine.Spy;
  beforeEach(async () => {
    cerrar = jasmine.createSpy('close');
    await TestBed.configureTestingModule({ imports: [DialogEstadoComponent], providers: [
      { provide: MatDialogRef, useValue: { close: cerrar } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(DialogEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('no permite confirmar sin un resultado válido', () => {
    const boton = fixture.nativeElement.querySelector('.primary');
    expect(boton.disabled).toBeTrue();
    component.confirmar();
    component.estado = 3;
    component.confirmar();
    expect(cerrar).not.toHaveBeenCalled();
  });
  for (const estado of [1, 2]) {
    it(`mantiene el resultado ${estado} al seleccionar y confirmar`, async () => {
      const radio = fixture.nativeElement.querySelectorAll('input[type="radio"]')[estado - 1];
      radio.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(component.estado).toBe(estado);
      expect(fixture.nativeElement.querySelector('.primary').disabled).toBeFalse();
      fixture.nativeElement.querySelector('.primary').click();
      expect(cerrar).toHaveBeenCalledWith(estado);
    });
  }
  it('cancelar y cerrar no envían un resultado de revisión', () => {
    fixture.nativeElement.querySelector('.secondary').click();
    fixture.nativeElement.querySelector('.icon-button').click();
    expect(cerrar).toHaveBeenCalledTimes(2);
    expect(cerrar).toHaveBeenCalledWith(null);
  });
});
