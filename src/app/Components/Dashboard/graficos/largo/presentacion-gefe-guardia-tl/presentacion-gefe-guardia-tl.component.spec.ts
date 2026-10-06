import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionGefeGuardiaTlComponent } from './presentacion-gefe-guardia-tl.component';

describe('PresentacionGefeGuardiaTlComponent', () => {
  let component: PresentacionGefeGuardiaTlComponent;
  let fixture: ComponentFixture<PresentacionGefeGuardiaTlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionGefeGuardiaTlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionGefeGuardiaTlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
