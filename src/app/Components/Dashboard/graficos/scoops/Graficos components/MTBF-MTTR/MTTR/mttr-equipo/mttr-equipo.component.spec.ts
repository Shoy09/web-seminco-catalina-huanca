import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrEquipoComponent } from './mttr-equipo.component';

describe('MttrEquipoComponent', () => {
  let component: MttrEquipoComponent;
  let fixture: ComponentFixture<MttrEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MttrEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MttrEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
