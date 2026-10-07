import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionGefeGuardiaEmpernadorComponent } from './presentacion-gefe-guardia-empernador.component';

describe('PresentacionGefeGuardiaEmpernadorComponent', () => {
  let component: PresentacionGefeGuardiaEmpernadorComponent;
  let fixture: ComponentFixture<PresentacionGefeGuardiaEmpernadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionGefeGuardiaEmpernadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionGefeGuardiaEmpernadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
