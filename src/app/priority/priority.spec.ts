import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Priority } from './priority';

describe('Priority', () => {
  let component: Priority;
  let fixture: ComponentFixture<Priority>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Priority]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Priority);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
