import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';

import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-side-visitor-view',
  templateUrl: './side-visitor-view.component.html',
  styleUrls: ['./side-visitor-view.component.css']
})
export class SideVisitorViewComponent implements OnInit {

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  onLoginSubmit(form: NgForm): void {
    this.authService.authenticateUser(form.value).subscribe(_data => {
      if (_data.success) {
        this.authService.storeUserData(_data.token, _data.user);
        location.reload();
      } else {
        $('#sideLoginError').css('display', 'inline');
        $('#sideLoginPassword').val('');
        form.value.password = '';

        setTimeout(() => {
          $('#sideLoginError').css('display', 'none');
        }, 3000);
      };
    });
  };
}
