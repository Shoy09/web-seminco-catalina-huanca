import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CucharasLaborComponent } from './cucharas-labor.component';

describe('CucharasLaborComponent', () => {
  let component: CucharasLaborComponent;
  let fixture: ComponentFixture<CucharasLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CucharasLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CucharasLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
