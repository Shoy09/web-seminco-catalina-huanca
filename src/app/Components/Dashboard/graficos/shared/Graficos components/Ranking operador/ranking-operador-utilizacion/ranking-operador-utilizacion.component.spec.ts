import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingOperadorUtilizacionComponent } from './ranking-operador-utilizacion.component';

describe('RankingOperadorUtilizacionComponent', () => {
  let component: RankingOperadorUtilizacionComponent;
  let fixture: ComponentFixture<RankingOperadorUtilizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingOperadorUtilizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankingOperadorUtilizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
