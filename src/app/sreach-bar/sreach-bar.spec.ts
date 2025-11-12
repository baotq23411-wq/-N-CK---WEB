import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SreachBarComponent } from './sreach-bar';

describe('SreachBarComponent', () => {
  let component: SreachBarComponent;
  let fixture: ComponentFixture<SreachBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SreachBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SreachBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
