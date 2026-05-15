import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoMesAnoComponent } from './rendimiento-mes-ano.component';

describe('RendimientoMesAnoComponent', () => {
  let component: RendimientoMesAnoComponent;
  let fixture: ComponentFixture<RendimientoMesAnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoMesAnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoMesAnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
