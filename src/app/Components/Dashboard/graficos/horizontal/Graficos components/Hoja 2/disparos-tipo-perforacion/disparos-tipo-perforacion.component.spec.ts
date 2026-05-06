import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisparosTipoPerforacionComponent } from './disparos-tipo-perforacion.component';

describe('DisparosTipoPerforacionComponent', () => {
  let component: DisparosTipoPerforacionComponent;
  let fixture: ComponentFixture<DisparosTipoPerforacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisparosTipoPerforacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisparosTipoPerforacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
