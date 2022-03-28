import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Statgraph2Component } from './statgraph2.component';

describe('Statgraph2Component', () => {
  let component: Statgraph2Component;
  let fixture: ComponentFixture<Statgraph2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Statgraph2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Statgraph2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
