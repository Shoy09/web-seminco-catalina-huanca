import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperacionesListComponent } from './operaciones-list.component';

describe('OperacionesListComponent', () => {
  let component: OperacionesListComponent;
  let fixture: ComponentFixture<OperacionesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperacionesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperacionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
