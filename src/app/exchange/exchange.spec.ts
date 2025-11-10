import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exchange } from './exchange';

describe('Exchange', () => {
  let component: Exchange;
  let fixture: ComponentFixture<Exchange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exchange]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Exchange);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
