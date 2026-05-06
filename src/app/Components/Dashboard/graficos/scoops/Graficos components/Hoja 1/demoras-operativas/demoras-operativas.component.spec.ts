import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemorasOperativasComponent } from './demoras-operativas.component';

describe('DemorasOperativasComponent', () => {
  let component: DemorasOperativasComponent;
  let fixture: ComponentFixture<DemorasOperativasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemorasOperativasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemorasOperativasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
