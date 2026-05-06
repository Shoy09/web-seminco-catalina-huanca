import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPerforacionComponent } from './formulario-perforacion.component';

describe('FormularioPerforacionComponent', () => {
  let component: FormularioPerforacionComponent;
  let fixture: ComponentFixture<FormularioPerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioPerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
