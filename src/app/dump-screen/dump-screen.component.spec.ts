import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DumpScreenComponent } from './dump-screen.component';

describe('DumpScreenComponent', () => {
  let component: DumpScreenComponent;
  let fixture: ComponentFixture<DumpScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DumpScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DumpScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
