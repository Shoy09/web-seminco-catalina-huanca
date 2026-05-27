import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoEquipoComponent } from './rendimiento-equipo.component';

describe('RendimientoEquipoComponent', () => {
  let component: RendimientoEquipoComponent;
  let fixture: ComponentFixture<RendimientoEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
