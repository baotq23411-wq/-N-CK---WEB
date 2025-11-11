import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPlaygroundComponent} from './header-playground';

describe('HeaderPlayground', () => {
  let component: HeaderPlaygroundComponent;
  let fixture: ComponentFixture<HeaderPlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderPlaygroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
