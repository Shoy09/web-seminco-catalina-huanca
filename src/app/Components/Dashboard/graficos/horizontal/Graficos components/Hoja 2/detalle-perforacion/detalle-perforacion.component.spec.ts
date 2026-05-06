import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePerforacionComponent } from './detalle-perforacion.component';

describe('DetallePerforacionComponent', () => {
  let component: DetallePerforacionComponent;
  let fixture: ComponentFixture<DetallePerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
