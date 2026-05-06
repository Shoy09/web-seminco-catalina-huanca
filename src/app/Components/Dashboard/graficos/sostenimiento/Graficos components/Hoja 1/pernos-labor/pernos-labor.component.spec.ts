import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PernosLaborComponent } from './pernos-labor.component';

describe('PernosLaborComponent', () => {
  let component: PernosLaborComponent;
  let fixture: ComponentFixture<PernosLaborComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PernosLaborComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PernosLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
