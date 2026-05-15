import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadDiaMesComponent } from './disponibilidad-dia-mes.component';

describe('DisponibilidadDiaMesComponent', () => {
  let component: DisponibilidadDiaMesComponent;
  let fixture: ComponentFixture<DisponibilidadDiaMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadDiaMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadDiaMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
