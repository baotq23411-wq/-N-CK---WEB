import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sao } from './sao';

describe('Sao', () => {
  let component: Sao;
  let fixture: ComponentFixture<Sao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
