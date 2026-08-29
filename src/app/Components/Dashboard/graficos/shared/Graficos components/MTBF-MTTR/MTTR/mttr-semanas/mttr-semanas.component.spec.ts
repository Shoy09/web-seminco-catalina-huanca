import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrSemanasComponent } from './mttr-semanas.component';

describe('MttrSemanasComponent', () => {
  let component: MttrSemanasComponent;
  let fixture: ComponentFixture<MttrSemanasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MttrSemanasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MttrSemanasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
