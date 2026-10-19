import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let cerrar: jasmine.Spy;
  beforeEach(async () => {
    cerrar = jasmine.createSpy('close');
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent], providers: [
      { provide: MatDialogRef, useValue: { close: cerrar } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
  });
  it('no confirma eliminación cuando se cancela o se cierra', () => {
    fixture.nativeElement.querySelector('.secondary').click();
    fixture.nativeElement.querySelector('.icon-button').click();
    expect(cerrar).toHaveBeenCalledTimes(2);
    expect(cerrar).toHaveBeenCalledWith(false);
  });
  it('confirma eliminación solo con el botón correspondiente', () => {
    fixture.nativeElement.querySelector('.danger').click();
    expect(cerrar).toHaveBeenCalledWith(true);
  });
});
