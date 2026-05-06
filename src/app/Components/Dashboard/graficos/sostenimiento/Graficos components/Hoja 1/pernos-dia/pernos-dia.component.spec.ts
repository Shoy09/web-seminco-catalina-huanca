import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PernosDiaComponent } from './pernos-dia.component';

describe('PernosDiaComponent', () => {
  let component: PernosDiaComponent;
  let fixture: ComponentFixture<PernosDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PernosDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PernosDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
