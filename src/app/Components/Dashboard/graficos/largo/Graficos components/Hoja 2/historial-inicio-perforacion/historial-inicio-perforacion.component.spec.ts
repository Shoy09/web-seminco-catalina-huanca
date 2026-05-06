import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialInicioPerforacionComponent } from './historial-inicio-perforacion.component';

describe('HistorialInicioPerforacionComponent', () => {
  let component: HistorialInicioPerforacionComponent;
  let fixture: ComponentFixture<HistorialInicioPerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialInicioPerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialInicioPerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
