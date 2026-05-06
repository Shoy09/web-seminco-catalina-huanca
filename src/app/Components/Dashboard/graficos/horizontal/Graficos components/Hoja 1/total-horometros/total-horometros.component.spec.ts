import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalHorometrosComponent } from './total-horometros.component';

describe('TotalHorometrosComponent', () => {
  let component: TotalHorometrosComponent;
  let fixture: ComponentFixture<TotalHorometrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalHorometrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalHorometrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
