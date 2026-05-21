import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfMesComponent } from './mtbf-mes.component';

describe('MtbfMesComponent', () => {
  let component: MtbfMesComponent;
  let fixture: ComponentFixture<MtbfMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MtbfMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtbfMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
