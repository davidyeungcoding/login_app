import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-side-profile-section',
  templateUrl: './side-profile-section.component.html',
  styleUrls: ['./side-profile-section.component.css']
})
export class SideProfileSectionComponent implements OnInit {

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  onLoginSubmit(form: NgForm): void {
    this.authService.authenticateUser(form.value).subscribe(data => {
      if (data.success) {
        this.authService.storeUserData(data.token, data.user);
        location.reload();
      } else {
        // handle error message here
        $('#sideLoginPassword').val('');
        form.value.password = '';
      };
    });
  };
}
