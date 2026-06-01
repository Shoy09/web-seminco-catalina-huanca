import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionAcarreoDialogComponent } from './presentacion-acarreo-dialog.component';

describe('PresentacionAcarreoDialogComponent', () => {
  let component: PresentacionAcarreoDialogComponent;
  let fixture: ComponentFixture<PresentacionAcarreoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionAcarreoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionAcarreoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
