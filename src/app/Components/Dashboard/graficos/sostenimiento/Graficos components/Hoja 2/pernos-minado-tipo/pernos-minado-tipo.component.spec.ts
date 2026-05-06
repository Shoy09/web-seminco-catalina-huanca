import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PernosMinadoTipoComponent } from './pernos-minado-tipo.component';

describe('PernosMinadoTipoComponent', () => {
  let component: PernosMinadoTipoComponent;
  let fixture: ComponentFixture<PernosMinadoTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PernosMinadoTipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PernosMinadoTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
