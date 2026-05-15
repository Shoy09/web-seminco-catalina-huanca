import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingOperadorRendimientoComponent } from './ranking-operador-rendimiento.component';

describe('RankingOperadorRendimientoComponent', () => {
  let component: RankingOperadorRendimientoComponent;
  let fixture: ComponentFixture<RankingOperadorRendimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingOperadorRendimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankingOperadorRendimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
