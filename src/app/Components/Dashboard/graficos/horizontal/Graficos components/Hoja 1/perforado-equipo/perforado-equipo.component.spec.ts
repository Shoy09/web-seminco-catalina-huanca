import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerforadoEquipoComponent } from './perforado-equipo.component';

describe('PerforadoEquipoComponent', () => {
  let component: PerforadoEquipoComponent;
  let fixture: ComponentFixture<PerforadoEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerforadoEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerforadoEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
