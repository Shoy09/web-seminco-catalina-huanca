import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromedioMaterialGuardiaComponent } from './promedio-material-guardia.component';

describe('PromedioMaterialGuardiaComponent', () => {
  let component: PromedioMaterialGuardiaComponent;
  let fixture: ComponentFixture<PromedioMaterialGuardiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromedioMaterialGuardiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromedioMaterialGuardiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
