import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaMetrosPerforadosEquipoComponent } from './tabla-metros-perforados-equipo.component';

describe('TablaMetrosPerforadosEquipoComponent', () => {
  let component: TablaMetrosPerforadosEquipoComponent;
  let fixture: ComponentFixture<TablaMetrosPerforadosEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaMetrosPerforadosEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaMetrosPerforadosEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
