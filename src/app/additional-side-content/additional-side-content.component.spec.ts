import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalSideContentComponent } from './additional-side-content.component';

describe('AdditionalSideContentComponent', () => {
  let component: AdditionalSideContentComponent;
  let fixture: ComponentFixture<AdditionalSideContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalSideContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalSideContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
