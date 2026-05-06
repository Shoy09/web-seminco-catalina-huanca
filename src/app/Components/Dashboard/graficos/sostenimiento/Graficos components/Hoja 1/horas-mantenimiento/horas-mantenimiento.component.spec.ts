import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasMantenimientoComponent } from './horas-mantenimiento.component';

describe('HorasMantenimientoComponent', () => {
  let component: HorasMantenimientoComponent;
  let fixture: ComponentFixture<HorasMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
