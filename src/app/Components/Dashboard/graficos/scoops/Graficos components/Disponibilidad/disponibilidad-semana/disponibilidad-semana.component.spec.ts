import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadSemanaComponent } from './disponibilidad-semana.component';

describe('DisponibilidadSemanaComponent', () => {
  let component: DisponibilidadSemanaComponent;
  let fixture: ComponentFixture<DisponibilidadSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
