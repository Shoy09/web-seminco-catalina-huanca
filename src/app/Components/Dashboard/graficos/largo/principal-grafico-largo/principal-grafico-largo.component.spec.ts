import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalGraficoLargoComponent } from './principal-grafico-largo.component';

describe('PrincipalGraficoLargoComponent', () => {
  let component: PrincipalGraficoLargoComponent;
  let fixture: ComponentFixture<PrincipalGraficoLargoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoLargoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoLargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
