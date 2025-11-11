import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reasons } from './reasons';

describe('Reasons', () => {
  let component: Reasons;
  let fixture: ComponentFixture<Reasons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reasons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reasons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
