import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadEstadoComponent } from './disponibilidad-estado.component';

describe('DisponibilidadEstadoComponent', () => {
  let component: DisponibilidadEstadoComponent;
  let fixture: ComponentFixture<DisponibilidadEstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadEstadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
