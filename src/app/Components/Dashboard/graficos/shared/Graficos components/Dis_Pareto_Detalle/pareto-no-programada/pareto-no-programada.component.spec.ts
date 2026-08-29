import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParetoNoProgramadaComponent } from './pareto-no-programada.component';

describe('ParetoNoProgramadaComponent', () => {
  let component: ParetoNoProgramadaComponent;
  let fixture: ComponentFixture<ParetoNoProgramadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParetoNoProgramadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParetoNoProgramadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
