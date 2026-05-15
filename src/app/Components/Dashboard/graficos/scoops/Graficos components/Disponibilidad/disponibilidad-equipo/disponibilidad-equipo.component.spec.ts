import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadEquipoComponent } from './disponibilidad-equipo.component';

describe('DisponibilidadEquipoComponent', () => {
  let component: DisponibilidadEquipoComponent;
  let fixture: ComponentFixture<DisponibilidadEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
