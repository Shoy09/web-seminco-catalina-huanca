import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorometroEmpernadorComponent } from './horometro-empernador.component';

describe('HorometroEmpernadorComponent', () => {
  let component: HorometroEmpernadorComponent;
  let fixture: ComponentFixture<HorometroEmpernadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorometroEmpernadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorometroEmpernadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
