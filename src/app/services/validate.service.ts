import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {
  private api = 'users';

  constructor(
    private http: HttpClient
  ) { }

  // ============
  // || Routes ||
  // ============

  checkUniqueUsername(username: string): any {
    return this.http.get(`${this.api}/unique?username=${username}`).pipe(
      catchError(err => of(err))
    );
  };

  // =================
  // || Validations ||
  // =================

  validateEmail(email: string): boolean {
    const regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    return regex.test(email);
  };

  validateUsername(username: string): boolean {
    const regex = /^\w+$/;
    return regex.test(username);
  };

  async checkUnique(username: string) {
    const unique = await new Promise(resolve => {
      this.checkUniqueUsername(username).subscribe(_status => {
        !_status ? $('#usernameError').css('visibility', 'visible')
        : $('#usernameError').css('visibility', 'hidden');
        resolve(_status);
      });
    });
    return unique;
  };

  async validateRegister(form: any) {
    try {
      let res: any = true;

      if (!form.email || !this.validateEmail(form.email)) {
        $('#emailError').css('visibility', 'visible');
        res = false;
      } else $('#emailError').css('visibility', 'hidden');
  
      if (!form.username || !this.validateUsername(form.username)) {
        $('#usernameError').css('visibility', 'visible');
        res = false;
      } else res = await this.checkUnique(form.username);
  
      if (!form.name) {
        $('#nameError').css('visibility', 'visible');
        res = false;
      } else $('#nameError').css('visibility', 'hidden');
  
      if (!form.password) {
        $('#passwordError').css('visibility', 'visible');
        res = false;
      } else $('#passwordError').css('visibility', 'hidden');

      return res;
    } catch {
      $('#failureMsg').css('display', 'block');
    };
  };
}
