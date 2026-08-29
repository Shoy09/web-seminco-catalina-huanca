import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfSemanasComponent } from './mtbf-semanas.component';

describe('MtbfSemanasComponent', () => {
  let component: MtbfSemanasComponent;
  let fixture: ComponentFixture<MtbfSemanasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MtbfSemanasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtbfSemanasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
