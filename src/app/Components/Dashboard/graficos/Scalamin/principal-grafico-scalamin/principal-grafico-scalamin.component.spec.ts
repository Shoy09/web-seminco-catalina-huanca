import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalGraficoScalaminComponent } from './principal-grafico-scalamin.component';

describe('PrincipalGraficoScalaminComponent', () => {
  let component: PrincipalGraficoScalaminComponent;
  let fixture: ComponentFixture<PrincipalGraficoScalaminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoScalaminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoScalaminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
