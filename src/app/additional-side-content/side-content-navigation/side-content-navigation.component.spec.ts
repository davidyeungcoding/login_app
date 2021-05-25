import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideContentNavigationComponent } from './side-content-navigation.component';

describe('SideContentNavigationComponent', () => {
  let component: SideContentNavigationComponent;
  let fixture: ComponentFixture<SideContentNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideContentNavigationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideContentNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
