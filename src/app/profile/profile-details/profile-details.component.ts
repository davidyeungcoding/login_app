import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  profileData: User;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(_user => this.profileData = _user);
  }

}
