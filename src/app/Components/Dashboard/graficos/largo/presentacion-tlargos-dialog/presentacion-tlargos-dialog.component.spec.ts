import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentacionTlargosDialogComponent } from './presentacion-tlargos-dialog.component';

describe('PresentacionTlargosDialogComponent', () => {
  let component: PresentacionTlargosDialogComponent;
  let fixture: ComponentFixture<PresentacionTlargosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentacionTlargosDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentacionTlargosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
