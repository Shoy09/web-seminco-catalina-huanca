import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfAnoComponent } from './mtbf-ano.component';

describe('MtbfAnoComponent', () => {
  let component: MtbfAnoComponent;
  let fixture: ComponentFixture<MtbfAnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MtbfAnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtbfAnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
