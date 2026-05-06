import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromedioEstadosEchartsComponent } from './promedio-estados-echarts.component';

describe('PromedioEstadosEchartsComponent', () => {
  let component: PromedioEstadosEchartsComponent;
  let fixture: ComponentFixture<PromedioEstadosEchartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromedioEstadosEchartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromedioEstadosEchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
