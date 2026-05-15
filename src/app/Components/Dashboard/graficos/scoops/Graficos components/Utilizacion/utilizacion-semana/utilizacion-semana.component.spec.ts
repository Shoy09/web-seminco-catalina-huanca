import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizacionSemanaComponent } from './utilizacion-semana.component';

describe('UtilizacionSemanaComponent', () => {
  let component: UtilizacionSemanaComponent;
  let fixture: ComponentFixture<UtilizacionSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizacionSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizacionSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
