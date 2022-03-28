import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Set2faComponent } from './set2fa.component';

describe('Set2faComponent', () => {
  let component: Set2faComponent;
  let fixture: ComponentFixture<Set2faComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Set2faComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Set2faComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
