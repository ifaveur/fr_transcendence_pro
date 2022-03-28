import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpchatComponent } from './mpchat.component';

describe('MpchatComponent', () => {
  let component: MpchatComponent;
  let fixture: ComponentFixture<MpchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MpchatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MpchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
