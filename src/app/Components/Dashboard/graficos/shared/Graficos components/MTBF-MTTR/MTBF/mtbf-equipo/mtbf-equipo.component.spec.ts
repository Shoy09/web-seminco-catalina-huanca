import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfEquipoComponent } from './mtbf-equipo.component';

describe('MtbfEquipoComponent', () => {
  let component: MtbfEquipoComponent;
  let fixture: ComponentFixture<MtbfEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MtbfEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MtbfEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
