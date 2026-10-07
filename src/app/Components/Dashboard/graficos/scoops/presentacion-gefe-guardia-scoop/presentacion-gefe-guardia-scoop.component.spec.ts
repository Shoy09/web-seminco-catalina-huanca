import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionGefeGuardiaScoopComponent } from './presentacion-gefe-guardia-scoop.component';

describe('PresentacionGefeGuardiaScoopComponent', () => {
  let component: PresentacionGefeGuardiaScoopComponent;
  let fixture: ComponentFixture<PresentacionGefeGuardiaScoopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionGefeGuardiaScoopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionGefeGuardiaScoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
