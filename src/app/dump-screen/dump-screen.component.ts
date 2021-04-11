import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dump-screen',
  templateUrl: './dump-screen.component.html',
  styleUrls: ['./dump-screen.component.css']
})
export class DumpScreenComponent implements OnInit {
  displayMessage: string;
  private dumpTerm: string;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.profileService.dumpMessage.subscribe(_msg => this.dumpTerm = _msg);
    this.displaySwitch();
  }

  handleTimedLogout(time: number): void {
    setTimeout(() => {
      this.authService.logout();
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
