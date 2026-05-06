import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormOperacionComponent } from './form-operacion.component';

describe('FormOperacionComponent', () => {
  let component: FormOperacionComponent;
  let fixture: ComponentFixture<FormOperacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormOperacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormOperacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
