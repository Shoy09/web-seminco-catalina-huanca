import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasFinPerforacionComponent } from './horas-fin-perforacion.component';

describe('HorasFinPerforacionComponent', () => {
  let component: HorasFinPerforacionComponent;
  let fixture: ComponentFixture<HorasFinPerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasFinPerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasFinPerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
