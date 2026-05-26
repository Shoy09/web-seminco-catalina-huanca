import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoDiaComponent } from './rendimiento-dia.component';

describe('RendimientoDiaComponent', () => {
  let component: RendimientoDiaComponent;
  let fixture: ComponentFixture<RendimientoDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
