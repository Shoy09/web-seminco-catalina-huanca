import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistTelemandoListaComponent } from './checklist-telemando-lista.component';

describe('ChecklistTelemandoListaComponent', () => {
  let component: ChecklistTelemandoListaComponent;
  let fixture: ComponentFixture<ChecklistTelemandoListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistTelemandoListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistTelemandoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
