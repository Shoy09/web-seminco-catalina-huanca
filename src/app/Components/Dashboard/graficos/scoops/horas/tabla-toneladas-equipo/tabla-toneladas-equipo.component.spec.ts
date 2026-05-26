import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaToneladasEquipoComponent } from './tabla-toneladas-equipo.component';

describe('TablaToneladasEquipoComponent', () => {
  let component: TablaToneladasEquipoComponent;
  let fixture: ComponentFixture<TablaToneladasEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaToneladasEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaToneladasEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
