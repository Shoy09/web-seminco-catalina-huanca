import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUtilizacionDiaMesComponent } from './app-utilizacion-dia-mes.component';

describe('AppUtilizacionDiaMesComponent', () => {
  let component: AppUtilizacionDiaMesComponent;
  let fixture: ComponentFixture<AppUtilizacionDiaMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppUtilizacionDiaMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUtilizacionDiaMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
