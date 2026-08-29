import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoDiaMesComponent } from './rendimiento-dia-mes.component';

describe('RendimientoDiaMesComponent', () => {
  let component: RendimientoDiaMesComponent;
  let fixture: ComponentFixture<RendimientoDiaMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoDiaMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoDiaMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
