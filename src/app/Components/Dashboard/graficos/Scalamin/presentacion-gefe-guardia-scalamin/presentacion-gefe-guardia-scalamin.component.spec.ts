import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionGefeGuardiaScalaminComponent } from './presentacion-gefe-guardia-scalamin.component';

describe('PresentacionGefeGuardiaScalaminComponent', () => {
  let component: PresentacionGefeGuardiaScalaminComponent;
  let fixture: ComponentFixture<PresentacionGefeGuardiaScalaminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionGefeGuardiaScalaminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionGefeGuardiaScalaminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
