import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToneladasRangoHoraComponent } from './toneladas-rango-hora.component';

describe('ToneladasRangoHoraComponent', () => {
  let component: ToneladasRangoHoraComponent;
  let fixture: ComponentFixture<ToneladasRangoHoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToneladasRangoHoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToneladasRangoHoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
