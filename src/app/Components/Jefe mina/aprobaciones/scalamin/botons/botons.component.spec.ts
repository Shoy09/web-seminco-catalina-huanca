/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BotonsComponent } from './botons.component';

describe('BotonsComponent', () => {
  let component: BotonsComponent;
  let fixture: ComponentFixture<BotonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
