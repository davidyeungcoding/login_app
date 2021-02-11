import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;

  constructor(
    private authService: AuthService,
    // private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(_user => this.user = _user);
    console.log(this.authService.currentUser)
    console.log(this.user)
    // || Below code used if there is autorization required to access
    // this.authService.getProfile().subscribe(profile => {
    //   this.user = profile.user;
    // },
    // err => {
    //   console.log(err);
    //   return false;
    // });
  }

}
