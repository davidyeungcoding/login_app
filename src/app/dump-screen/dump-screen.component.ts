import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dump-screen',
  templateUrl: './dump-screen.component.html',
  styleUrls: ['./dump-screen.component.css']
})
export class DumpScreenComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private dumpTerm: string;
  private activeTab: string;
  private activeList: string;
  displayMessage: string;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.profileService.dumpMessage.subscribe(_msg => this.dumpTerm = _msg));
    this.subscriptions.add(this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab));
    this.subscriptions.add(this.profileService.activeList.subscribe(_list => this.activeList = _list));
    this.displaySwitch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleTimedLogout(time: number): void {
    setTimeout(() => {
      this.authService.logout(this.activeTab, this.activeList);
      this.router.navigate(['/home']);
    }, time);
  };

  displaySwitch(): void {
    switch (this.dumpTerm) {
      case 'profile':
        this.displayMessage = 'Unable to load your profile. Logging you out and redirecting you to the homepage shortly.';
        this.handleTimedLogout(7000);
        break;
      case 'session':
        this.displayMessage = 'Session timed out. Logging you out and redirecting you to the homepage shortly. If you\'d like to avoid this in the futrue, please be sure to logout when you\'re done.';
        this.handleTimedLogout(12000);
        break;
      default:
        this.displayMessage = 'Something went wrong, redirecting you to the homepage.'
        this.handleTimedLogout(3000);
    };
  };
}
