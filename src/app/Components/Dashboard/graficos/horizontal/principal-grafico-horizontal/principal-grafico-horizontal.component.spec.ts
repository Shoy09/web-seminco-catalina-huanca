import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalGraficoHorizontalComponent } from './principal-grafico-horizontal.component';

describe('PrincipalGraficoHorizontalComponent', () => {
  let component: PrincipalGraficoHorizontalComponent;
  let fixture: ComponentFixture<PrincipalGraficoHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalGraficoHorizontalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalGraficoHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
