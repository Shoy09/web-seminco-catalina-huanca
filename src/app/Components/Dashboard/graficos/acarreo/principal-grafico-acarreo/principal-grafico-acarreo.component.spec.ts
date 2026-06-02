import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalGraficoAcarreoComponent } from './principal-grafico-acarreo.component';

describe('PrincipalGraficoAcarreoComponent', () => {
  let component: PrincipalGraficoAcarreoComponent;
  let fixture: ComponentFixture<PrincipalGraficoAcarreoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoAcarreoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoAcarreoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
