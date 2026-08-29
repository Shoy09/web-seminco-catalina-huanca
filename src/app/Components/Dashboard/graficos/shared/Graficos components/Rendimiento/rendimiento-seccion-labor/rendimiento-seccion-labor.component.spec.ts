import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoSeccionLaborComponent } from './rendimiento-seccion-labor.component';

describe('RendimientoSeccionLaborComponent', () => {
  let component: RendimientoSeccionLaborComponent;
  let fixture: ComponentFixture<RendimientoSeccionLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoSeccionLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoSeccionLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
