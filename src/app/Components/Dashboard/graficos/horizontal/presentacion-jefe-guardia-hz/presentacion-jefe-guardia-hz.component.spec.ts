import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionJefeGuardiaHzComponent } from './presentacion-jefe-guardia-hz.component';

describe('PresentacionJefeGuardiaHzComponent', () => {
  let component: PresentacionJefeGuardiaHzComponent;
  let fixture: ComponentFixture<PresentacionJefeGuardiaHzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionJefeGuardiaHzComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionJefeGuardiaHzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
