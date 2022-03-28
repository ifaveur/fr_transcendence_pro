import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpComponent } from './mp.component';

describe('MpComponent', () => {
  let component: MpComponent;
  let fixture: ComponentFixture<MpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
