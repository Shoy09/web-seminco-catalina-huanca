import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrosEquipoComponent } from './metros-equipo.component';

describe('MetrosEquipoComponent', () => {
  let component: MetrosEquipoComponent;
  let fixture: ComponentFixture<MetrosEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetrosEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetrosEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
