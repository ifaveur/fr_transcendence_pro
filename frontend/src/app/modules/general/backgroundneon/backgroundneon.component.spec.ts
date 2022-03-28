import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundneonComponent } from './backgroundneon.component';

describe('BackgroundneonComponent', () => {
  let component: BackgroundneonComponent;
  let fixture: ComponentFixture<BackgroundneonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackgroundneonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundneonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
