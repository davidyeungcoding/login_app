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
  private isEditing: boolean;
  private lastVisited: string;
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
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
    this.subscriptions.add(this.authService.lastVisited.subscribe(_location => this.lastVisited = _location));
    this.displaySwitch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleTimedLogout(time: number, logged: boolean): void {
    setTimeout(() => {
      if (logged) this.authService.logout(this.activeTab, this.activeList, this.isEditing);
      this.router.navigate(['/home']);
    }, time);
  };
  
  displaySwitch(): void {
    const logged = !!localStorage.getItem('id_token');
    const personalError = logged && this.lastVisited === JSON.parse(localStorage.getItem('user')).username;
    
    switch (this.dumpTerm) {
      case 'profile':
        this.displayMessage = personalError ? 'Unable to load profile. Logging you out and redirecting to Home.'
        : 'Unable to load profile. Returning to you to Home Screen.';
        this.handleTimedLogout(3000, personalError);
        break;
      case 'session':
        this.displayMessage = 'Session timed out. Logging you out and redirecting you to the homepage shortly. If you\'d like to avoid this in the futrue, please be sure to logout when you\'re done.';
        this.handleTimedLogout(5000, logged);
        break;
      default:
        this.displayMessage = 'Something went wrong, redirecting you to the homepage.'
        this.handleTimedLogout(3000, logged);
    };
  };
}
