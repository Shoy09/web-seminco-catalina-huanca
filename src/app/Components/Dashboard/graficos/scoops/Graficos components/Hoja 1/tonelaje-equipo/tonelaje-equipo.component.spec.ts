import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TonelajeEquipoComponent } from './tonelaje-equipo.component';

describe('TonelajeEquipoComponent', () => {
  let component: TonelajeEquipoComponent;
  let fixture: ComponentFixture<TonelajeEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TonelajeEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TonelajeEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
