import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParetoDisponibilidadComponent } from './pareto-disponibilidad.component';

describe('ParetoDisponibilidadComponent', () => {
  let component: ParetoDisponibilidadComponent;
  let fixture: ComponentFixture<ParetoDisponibilidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParetoDisponibilidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParetoDisponibilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
