import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrosPerforadosRangoHoraComponent } from './metros-perforados-rango-hora.component';

describe('MetrosPerforadosRangoHoraComponent', () => {
  let component: MetrosPerforadosRangoHoraComponent;
  let fixture: ComponentFixture<MetrosPerforadosRangoHoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetrosPerforadosRangoHoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetrosPerforadosRangoHoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
