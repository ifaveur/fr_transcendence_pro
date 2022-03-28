import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomegamelistComponent } from './homegamelist.component';

describe('HomegamelistComponent', () => {
  let component: HomegamelistComponent;
  let fixture: ComponentFixture<HomegamelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomegamelistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomegamelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
