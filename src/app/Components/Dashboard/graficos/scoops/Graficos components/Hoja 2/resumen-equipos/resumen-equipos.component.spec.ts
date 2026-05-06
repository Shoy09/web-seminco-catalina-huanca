import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenEquiposComponent } from './resumen-equipos.component';

describe('ResumenEquiposComponent', () => {
  let component: ResumenEquiposComponent;
  let fixture: ComponentFixture<ResumenEquiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenEquiposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenEquiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
