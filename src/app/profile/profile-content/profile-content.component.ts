import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile-content',
  templateUrl: './profile-content.component.html',
  styleUrls: ['./profile-content.component.css']
})
export class ProfileContentComponent implements OnInit {
  private profileData: User;
  private currentUser: any;
  private activeData: string = 'postList';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(_user => this.profileData = _user);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
  }

  personalProfile() {
    return this.authService.personalProfile(this.currentUser, this.profileData);
  };

  onMakeActive(id: string): void {
    const current = document.getElementById(id);
    const previous = document.getElementById(this.activeData);

    if (id !== this.activeData) {
      previous.classList.add('visible');
      current.classList.remove('visible');
      this.activeData = id;
    };
  };

  onFollow() {
    
  }
}
