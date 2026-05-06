import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterTurnosNocheComponent } from './scatter-turnos-noche.component';

describe('ScatterTurnosNocheComponent', () => {
  let component: ScatterTurnosNocheComponent;
  let fixture: ComponentFixture<ScatterTurnosNocheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterTurnosNocheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScatterTurnosNocheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
