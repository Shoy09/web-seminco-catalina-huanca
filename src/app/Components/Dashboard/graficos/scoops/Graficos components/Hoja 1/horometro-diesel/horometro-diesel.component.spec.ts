import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorometroDieselComponent } from './horometro-diesel.component';

describe('HorometroDieselComponent', () => {
  let component: HorometroDieselComponent;
  let fixture: ComponentFixture<HorometroDieselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorometroDieselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorometroDieselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
