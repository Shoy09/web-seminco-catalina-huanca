import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MhrEquipoComponent } from './mhr-equipo.component';

describe('MhrEquipoComponent', () => {
  let component: MhrEquipoComponent;
  let fixture: ComponentFixture<MhrEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MhrEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MhrEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
