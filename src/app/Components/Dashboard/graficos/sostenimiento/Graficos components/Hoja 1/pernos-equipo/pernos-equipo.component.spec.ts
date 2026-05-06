import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PernosEquipoComponent } from './pernos-equipo.component';

describe('PernosEquipoComponent', () => {
  let component: PernosEquipoComponent;
  let fixture: ComponentFixture<PernosEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PernosEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PernosEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
