import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistTelemandoFormDialogComponent } from './checklist-telemando-form-dialog.component';

describe('ChecklistTelemandoFormDialogComponent', () => {
  let component: ChecklistTelemandoFormDialogComponent;
  let fixture: ComponentFixture<ChecklistTelemandoFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistTelemandoFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistTelemandoFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
