import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatselectorComponent } from './chatselector.component';

describe('ChatselectorComponent', () => {
  let component: ChatselectorComponent;
  let fixture: ComponentFixture<ChatselectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatselectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatselectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
