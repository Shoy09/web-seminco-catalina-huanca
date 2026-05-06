import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleSostenimientoComponent } from './detalle-sostenimiento.component';

describe('DetalleSostenimientoComponent', () => {
  let component: DetalleSostenimientoComponent;
  let fixture: ComponentFixture<DetalleSostenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleSostenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleSostenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
