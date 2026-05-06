import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasInicioPerforacionComponent } from './horas-inicio-perforacion.component';

describe('HorasInicioPerforacionComponent', () => {
  let component: HorasInicioPerforacionComponent;
  let fixture: ComponentFixture<HorasInicioPerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasInicioPerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasInicioPerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
