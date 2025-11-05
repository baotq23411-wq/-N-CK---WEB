import { ComponentFixture, TestBed } from '@angular/core/testing';

import BlogListPanacea from './blog-list';

describe('BlogListPanacea', () => {
  let component: BlogListPanacea;
  let fixture: ComponentFixture<BlogListPanacea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogListPanacea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogListPanacea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
