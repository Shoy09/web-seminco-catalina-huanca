import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorometrosJumbosComponent } from './horometros-jumbos.component';

describe('HorometrosJumbosComponent', () => {
  let component: HorometrosJumbosComponent;
  let fixture: ComponentFixture<HorometrosJumbosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorometrosJumbosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorometrosJumbosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
