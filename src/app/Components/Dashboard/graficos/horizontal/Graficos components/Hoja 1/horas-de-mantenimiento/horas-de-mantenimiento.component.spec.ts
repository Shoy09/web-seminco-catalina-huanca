import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasDeMantenimientoComponent } from './horas-de-mantenimiento.component';

describe('HorasDeMantenimientoComponent', () => {
  let component: HorasDeMantenimientoComponent;
  let fixture: ComponentFixture<HorasDeMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasDeMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasDeMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
