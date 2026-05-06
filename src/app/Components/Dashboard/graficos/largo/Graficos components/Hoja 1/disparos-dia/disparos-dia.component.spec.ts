import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisparosDiaComponent } from './disparos-dia.component';

describe('DisparosDiaComponent', () => {
  let component: DisparosDiaComponent;
  let fixture: ComponentFixture<DisparosDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisparosDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisparosDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
