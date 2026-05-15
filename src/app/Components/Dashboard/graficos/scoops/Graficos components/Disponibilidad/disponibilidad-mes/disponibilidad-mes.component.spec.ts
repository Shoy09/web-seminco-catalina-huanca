import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibilidadMesComponent } from './disponibilidad-mes.component';

describe('DisponibilidadMesComponent', () => {
  let component: DisponibilidadMesComponent;
  let fixture: ComponentFixture<DisponibilidadMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibilidadMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
