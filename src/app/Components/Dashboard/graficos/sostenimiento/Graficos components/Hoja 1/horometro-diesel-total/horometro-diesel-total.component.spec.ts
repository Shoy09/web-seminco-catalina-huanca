import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorometroDieselTotalComponent } from './horometro-diesel-total.component';

describe('HorometroDieselTotalComponent', () => {
  let component: HorometroDieselTotalComponent;
  let fixture: ComponentFixture<HorometroDieselTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorometroDieselTotalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorometroDieselTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
