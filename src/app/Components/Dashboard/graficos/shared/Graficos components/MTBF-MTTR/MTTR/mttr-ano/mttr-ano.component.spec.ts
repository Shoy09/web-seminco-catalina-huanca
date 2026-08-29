import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrAnoComponent } from './mttr-ano.component';

describe('MttrAnoComponent', () => {
  let component: MttrAnoComponent;
  let fixture: ComponentFixture<MttrAnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MttrAnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MttrAnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
