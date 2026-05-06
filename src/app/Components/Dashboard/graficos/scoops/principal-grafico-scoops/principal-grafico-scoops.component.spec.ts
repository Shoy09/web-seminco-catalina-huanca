import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalGraficoScoopsComponent } from './principal-grafico-scoops.component';

describe('PrincipalGraficoScoopsComponent', () => {
  let component: PrincipalGraficoScoopsComponent;
  let fixture: ComponentFixture<PrincipalGraficoScoopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoScoopsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoScoopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
