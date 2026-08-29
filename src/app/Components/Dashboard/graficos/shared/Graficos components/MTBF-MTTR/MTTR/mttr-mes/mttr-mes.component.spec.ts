import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrMesComponent } from './mttr-mes.component';

describe('MttrMesComponent', () => {
  let component: MttrMesComponent;
  let fixture: ComponentFixture<MttrMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MttrMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MttrMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
