import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioOperacionComponent } from './formulario-operacion.component';

describe('FormularioOperacionComponent', () => {
  let component: FormularioOperacionComponent;
  let fixture: ComponentFixture<FormularioOperacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioOperacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioOperacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
