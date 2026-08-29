import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoSemanaComponent } from './rendimiento-semana.component';

describe('RendimientoSemanaComponent', () => {
  let component: RendimientoSemanaComponent;
  let fixture: ComponentFixture<RendimientoSemanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoSemanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoSemanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
