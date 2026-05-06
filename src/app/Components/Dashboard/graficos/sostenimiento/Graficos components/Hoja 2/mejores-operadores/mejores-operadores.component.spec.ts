import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MejoresOperadoresComponent } from './mejores-operadores.component';

describe('MejoresOperadoresComponent', () => {
  let component: MejoresOperadoresComponent;
  let fixture: ComponentFixture<MejoresOperadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MejoresOperadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MejoresOperadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
