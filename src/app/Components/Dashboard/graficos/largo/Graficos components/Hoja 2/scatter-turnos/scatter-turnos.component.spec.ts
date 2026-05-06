import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterTurnosComponent } from './scatter-turnos.component';

describe('ScatterTurnosComponent', () => {
  let component: ScatterTurnosComponent;
  let fixture: ComponentFixture<ScatterTurnosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterTurnosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScatterTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
