import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasPrimeraPerforacionComponent } from './horas-primera-perforacion.component';

describe('HorasPrimeraPerforacionComponent', () => {
  let component: HorasPrimeraPerforacionComponent;
  let fixture: ComponentFixture<HorasPrimeraPerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasPrimeraPerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasPrimeraPerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
