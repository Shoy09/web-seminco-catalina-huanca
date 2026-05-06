import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialUltimoPerforacionComponent } from './historial-ultimo-perforacion.component';

describe('HistorialUltimoPerforacionComponent', () => {
  let component: HistorialUltimoPerforacionComponent;
  let fixture: ComponentFixture<HistorialUltimoPerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialUltimoPerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialUltimoPerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
