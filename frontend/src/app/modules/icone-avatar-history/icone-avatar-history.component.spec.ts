import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconeAvatarHistoryComponent } from './icone-avatar-history.component';

describe('IconeAvatarHistoryComponent', () => {
  let component: IconeAvatarHistoryComponent;
  let fixture: ComponentFixture<IconeAvatarHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconeAvatarHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconeAvatarHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
