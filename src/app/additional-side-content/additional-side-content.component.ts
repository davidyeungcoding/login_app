import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-additional-side-content',
  templateUrl: './additional-side-content.component.html',
  styleUrls: ['./additional-side-content.component.css']
})
export class AdditionalSideContentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  currentUser: any;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
