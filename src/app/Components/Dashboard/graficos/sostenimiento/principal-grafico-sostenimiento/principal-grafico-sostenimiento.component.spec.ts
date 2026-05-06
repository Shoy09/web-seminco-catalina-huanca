import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalGraficoSostenimientoComponent } from './principal-grafico-sostenimiento.component';

describe('PrincipalGraficoSostenimientoComponent', () => {
  let component: PrincipalGraficoSostenimientoComponent;
  let fixture: ComponentFixture<PrincipalGraficoSostenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoSostenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoSostenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
