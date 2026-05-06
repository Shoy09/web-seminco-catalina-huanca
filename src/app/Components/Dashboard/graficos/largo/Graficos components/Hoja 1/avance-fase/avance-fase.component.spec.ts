import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvanceFaseComponent } from './avance-fase.component';

describe('AvanceFaseComponent', () => {
  let component: AvanceFaseComponent;
  let fixture: ComponentFixture<AvanceFaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvanceFaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvanceFaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
