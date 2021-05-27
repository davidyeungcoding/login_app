import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideVisitorViewComponent } from './side-visitor-view.component';

describe('SideVisitorViewComponent', () => {
  let component: SideVisitorViewComponent;
  let fixture: ComponentFixture<SideVisitorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideVisitorViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideVisitorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
