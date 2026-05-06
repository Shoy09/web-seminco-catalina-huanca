import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrosPerforadosDisparoComponent } from './metros-perforados-disparo.component';

describe('MetrosPerforadosDisparoComponent', () => {
  let component: MetrosPerforadosDisparoComponent;
  let fixture: ComponentFixture<MetrosPerforadosDisparoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetrosPerforadosDisparoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetrosPerforadosDisparoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
