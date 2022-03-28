import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconeAvatarChatComponent } from './icone-avatar-chat.component';

describe('IconeAvatarChatComponent', () => {
  let component: IconeAvatarChatComponent;
  let fixture: ComponentFixture<IconeAvatarChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconeAvatarChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconeAvatarChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
