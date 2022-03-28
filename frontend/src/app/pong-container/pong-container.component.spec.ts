import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PongContainerComponent } from './pong-container.component';

describe('PongContainerComponent', () => {
  let component: PongContainerComponent;
  let fixture: ComponentFixture<PongContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PongContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PongContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
