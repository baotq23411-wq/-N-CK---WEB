import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GardensComponent } from './gardens';

describe('Gardens', () => {
  let component: GardensComponent;
  let fixture: ComponentFixture<GardensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GardensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GardensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
