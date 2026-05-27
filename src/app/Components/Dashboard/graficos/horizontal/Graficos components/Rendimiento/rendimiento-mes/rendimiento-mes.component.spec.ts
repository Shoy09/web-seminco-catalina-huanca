import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoMesComponent } from './rendimiento-mes.component';

describe('RendimientoMesComponent', () => {
  let component: RendimientoMesComponent;
  let fixture: ComponentFixture<RendimientoMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
