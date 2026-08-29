import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParetoUtilizacionComponent } from './pareto-utilizacion.component';

describe('ParetoUtilizacionComponent', () => {
  let component: ParetoUtilizacionComponent;
  let fixture: ComponentFixture<ParetoUtilizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParetoUtilizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParetoUtilizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
