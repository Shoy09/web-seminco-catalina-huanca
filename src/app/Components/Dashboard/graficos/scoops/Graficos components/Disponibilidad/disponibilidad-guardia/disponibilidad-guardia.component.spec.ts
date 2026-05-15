import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadGuardiaComponent } from './disponibilidad-guardia.component';

describe('DisponibilidadGuardiaComponent', () => {
  let component: DisponibilidadGuardiaComponent;
  let fixture: ComponentFixture<DisponibilidadGuardiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadGuardiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadGuardiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
