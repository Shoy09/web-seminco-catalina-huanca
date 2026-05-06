import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemorasInoperativasComponent } from './demoras-inoperativas.component';

describe('DemorasInoperativasComponent', () => {
  let component: DemorasInoperativasComponent;
  let fixture: ComponentFixture<DemorasInoperativasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemorasInoperativasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemorasInoperativasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
