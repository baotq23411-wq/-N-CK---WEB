import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeVideoComponent } from './home-video';

describe('HomeVideo', () => {
  let component: HomeVideoComponent;
  let fixture: ComponentFixture<HomeVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
