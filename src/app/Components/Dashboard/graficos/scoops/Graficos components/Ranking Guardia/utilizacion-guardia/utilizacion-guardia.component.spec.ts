import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizacionGuardiaComponent } from './utilizacion-guardia.component';

describe('UtilizacionGuardiaComponent', () => {
  let component: UtilizacionGuardiaComponent;
  let fixture: ComponentFixture<UtilizacionGuardiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizacionGuardiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizacionGuardiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
