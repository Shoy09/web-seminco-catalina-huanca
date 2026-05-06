import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDisparosComponent } from './detalle-disparos.component';

describe('DetalleDisparosComponent', () => {
  let component: DetalleDisparosComponent;
  let fixture: ComponentFixture<DetalleDisparosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleDisparosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleDisparosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
