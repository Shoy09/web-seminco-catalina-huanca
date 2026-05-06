import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CucharasEquipoComponent } from './cucharas-equipo.component';

describe('CucharasEquipoComponent', () => {
  let component: CucharasEquipoComponent;
  let fixture: ComponentFixture<CucharasEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CucharasEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CucharasEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
