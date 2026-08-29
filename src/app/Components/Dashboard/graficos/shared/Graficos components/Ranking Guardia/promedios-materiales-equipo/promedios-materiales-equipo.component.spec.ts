import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromediosMaterialesEquipoComponent } from './promedios-materiales-equipo.component';

describe('PromediosMaterialesEquipoComponent', () => {
  let component: PromediosMaterialesEquipoComponent;
  let fixture: ComponentFixture<PromediosMaterialesEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromediosMaterialesEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromediosMaterialesEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
