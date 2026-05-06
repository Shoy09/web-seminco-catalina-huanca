import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TnHrEquipoComponent } from './tn-hr-equipo.component';

describe('TnHrEquipoComponent', () => {
  let component: TnHrEquipoComponent;
  let fixture: ComponentFixture<TnHrEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnHrEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TnHrEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
