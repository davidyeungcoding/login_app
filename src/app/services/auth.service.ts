import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authToken: any;
  // user: any;
  private userSource = new BehaviorSubject<any>(null);
  currentUser = this.userSource.asObservable();
  api = 'http://localhost:3000/users';

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { }

  registerUser(user) {
    return this.http.post(`${this.api}/register`, user, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  authenticateUser(user) {
    return this.http.post(`${this.api}/authenticate`, user, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  // getProfile() {
  //   let headers = new HttpHeaders();
  //   this.loadToken();
  //   headers.append('Authorization', this.authToken);
  //   headers.append('Content-Type', 'application/json');
  //   return this.http.get(`${this.api}/profile`, { headers: headers }).pipe(
  //     catchError(err => of(err))
  //   );
  // };

  storeUserData(token, user): void {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    // this.user = user;
    this.changeUser(user);
  };

  // loadToken() {
  //   const token = localStorage.getItem('id_token');
  //   this.authToken = token;
  // };

  loggedIn() {
    return this.jwtHelper.isTokenExpired();
  };

  changeUser(user: any): void {
    this.userSource.next(user);
  };

  logout(): void {
    this.authToken = null;
    // this.user = null;
    this.changeUser(null);
    localStorage.clear();
  };
}
