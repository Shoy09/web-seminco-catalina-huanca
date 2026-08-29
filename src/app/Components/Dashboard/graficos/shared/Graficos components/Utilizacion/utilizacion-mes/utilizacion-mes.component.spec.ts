import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizacionMesComponent } from './utilizacion-mes.component';

describe('UtilizacionMesComponent', () => {
  let component: UtilizacionMesComponent;
  let fixture: ComponentFixture<UtilizacionMesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizacionMesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizacionMesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
