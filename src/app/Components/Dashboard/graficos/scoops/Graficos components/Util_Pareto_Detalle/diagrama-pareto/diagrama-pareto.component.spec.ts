import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramaParetoComponent } from './diagrama-pareto.component';

describe('DiagramaParetoComponent', () => {
  let component: DiagramaParetoComponent;
  let fixture: ComponentFixture<DiagramaParetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagramaParetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagramaParetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
