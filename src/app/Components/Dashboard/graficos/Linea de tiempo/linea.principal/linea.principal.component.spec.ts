import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaPrincipalComponent } from './linea.principal.component';

describe('LineaPrincipalComponent', () => {
  let component: LineaPrincipalComponent;
  let fixture: ComponentFixture<LineaPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineaPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineaPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
