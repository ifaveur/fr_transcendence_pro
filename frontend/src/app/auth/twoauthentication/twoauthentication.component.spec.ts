import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoauthenticationComponent } from './twoauthentication.component';

describe('TwoauthenticationComponent', () => {
  let component: TwoauthenticationComponent;
  let fixture: ComponentFixture<TwoauthenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoauthenticationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoauthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
