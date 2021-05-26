import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideProfileSectionComponent } from './side-profile-section.component';

describe('SideProfileSectionComponent', () => {
  let component: SideProfileSectionComponent;
  let fixture: ComponentFixture<SideProfileSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideProfileSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideProfileSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
