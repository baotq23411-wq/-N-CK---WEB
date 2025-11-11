import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Xu } from './xu';

describe('Xu', () => {
  let component: Xu;
  let fixture: ComponentFixture<Xu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Xu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Xu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
