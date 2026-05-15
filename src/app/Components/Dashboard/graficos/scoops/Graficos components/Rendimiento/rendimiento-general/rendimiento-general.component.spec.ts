import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoGeneralComponent } from './rendimiento-general.component';

describe('RendimientoGeneralComponent', () => {
  let component: RendimientoGeneralComponent;
  let fixture: ComponentFixture<RendimientoGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendimientoGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
