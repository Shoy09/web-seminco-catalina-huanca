import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MejoresOperadoresGraficoComponent } from './mejores-operadores-grafico.component';

describe('MejoresOperadoresGraficoComponent', () => {
  let component: MejoresOperadoresGraficoComponent;
  let fixture: ComponentFixture<MejoresOperadoresGraficoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MejoresOperadoresGraficoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MejoresOperadoresGraficoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
