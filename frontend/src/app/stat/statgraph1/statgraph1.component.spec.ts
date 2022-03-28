import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Statgraph1Component } from './statgraph1.component';

describe('Statgraph1Component', () => {
  let component: Statgraph1Component;
  let fixture: ComponentFixture<Statgraph1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Statgraph1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Statgraph1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
