import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PernosInstaladosTipoComponent } from './pernos-instalados-tipo.component';

describe('PernosInstaladosTipoComponent', () => {
  let component: PernosInstaladosTipoComponent;
  let fixture: ComponentFixture<PernosInstaladosTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PernosInstaladosTipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PernosInstaladosTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
