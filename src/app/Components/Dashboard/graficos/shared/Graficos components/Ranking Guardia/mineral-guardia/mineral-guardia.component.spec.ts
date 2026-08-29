import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MineralGuardiaComponent } from './mineral-guardia.component';

describe('MineralGuardiaComponent', () => {
  let component: MineralGuardiaComponent;
  let fixture: ComponentFixture<MineralGuardiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MineralGuardiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MineralGuardiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
