import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisparosEquipoComponent } from './disparos-equipo.component';

describe('DisparosEquipoComponent', () => {
  let component: DisparosEquipoComponent;
  let fixture: ComponentFixture<DisparosEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisparosEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisparosEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
