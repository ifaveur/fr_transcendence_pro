import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconeAvatarComponent } from './icone-avatar.component';

describe('IconeAvatarComponent', () => {
  let component: IconeAvatarComponent;
  let fixture: ComponentFixture<IconeAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconeAvatarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconeAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
