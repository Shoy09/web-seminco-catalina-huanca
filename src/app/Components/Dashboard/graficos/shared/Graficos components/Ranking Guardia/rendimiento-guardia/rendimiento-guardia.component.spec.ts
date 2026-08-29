import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoGuardiaComponent } from './rendimiento-guardia.component';

describe('RendimientoGuardiaComponent', () => {
  let component: RendimientoGuardiaComponent;
  let fixture: ComponentFixture<RendimientoGuardiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoGuardiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoGuardiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
