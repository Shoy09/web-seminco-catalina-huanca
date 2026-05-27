import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionDialogComponent } from './presentacion-dialog.component';

describe('PresentacionDialogComponent', () => {
  let component: PresentacionDialogComponent;
  let fixture: ComponentFixture<PresentacionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
