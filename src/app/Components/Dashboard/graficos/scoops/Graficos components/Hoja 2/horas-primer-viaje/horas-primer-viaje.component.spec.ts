import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasPrimerViajeComponent } from './horas-primer-viaje.component';

describe('HorasPrimerViajeComponent', () => {
  let component: HorasPrimerViajeComponent;
  let fixture: ComponentFixture<HorasPrimerViajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasPrimerViajeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasPrimerViajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
