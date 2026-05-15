import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopEquiposComponent } from './top-equipos.component';

describe('TopEquiposComponent', () => {
  let component: TopEquiposComponent;
  let fixture: ComponentFixture<TopEquiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopEquiposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopEquiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
