import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateroomComponent } from './createroom.component';

describe('CreateroomComponent', () => {
  let component: CreateroomComponent;
  let fixture: ComponentFixture<CreateroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateroomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
