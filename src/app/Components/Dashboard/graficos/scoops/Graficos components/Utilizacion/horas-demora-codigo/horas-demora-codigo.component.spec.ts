import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasDemoraCodigoComponent } from './horas-demora-codigo.component';

describe('HorasDemoraCodigoComponent', () => {
  let component: HorasDemoraCodigoComponent;
  let fixture: ComponentFixture<HorasDemoraCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasDemoraCodigoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasDemoraCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
