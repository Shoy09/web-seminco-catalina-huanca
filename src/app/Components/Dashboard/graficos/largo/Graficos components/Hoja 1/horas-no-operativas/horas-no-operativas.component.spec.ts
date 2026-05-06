import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasNoOperativasComponent } from './horas-no-operativas.component';

describe('HorasNoOperativasComponent', () => {
  let component: HorasNoOperativasComponent;
  let fixture: ComponentFixture<HorasNoOperativasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasNoOperativasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasNoOperativasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
