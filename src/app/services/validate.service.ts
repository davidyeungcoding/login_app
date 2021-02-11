import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  validateRegister(user) {
    return !user.email || !user.username || !user.name || !user.password ? false : true;
  }

  validateEmail(email) {
    const rx = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    return rx.test(email);
  }
}
