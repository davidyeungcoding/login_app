import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../interfaces/user';

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
  private localUser = JSON.parse(localStorage.getItem('user'));
  private emptyUser = {
    id: false,
    username: false,
    name: false,
    email: false
  };
  private userSource = new BehaviorSubject<any>(this.localUser ? this.localUser : this.emptyUser);
  currentUser = this.userSource.asObservable();
  private profileDataSource = new BehaviorSubject<any>({});
  profileData = this.profileDataSource.asObservable();
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

  getProfile(username) {
    return this.http.get(`${this.api}/profile/${username}`).pipe(
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
    this.changeUser(user);
  };

  // loadToken() {
  //   const token = localStorage.getItem('id_token');
  //   this.authToken = token;
  // };

  isValid() {
    return this.jwtHelper.isTokenExpired();
  };

  changeUser(user: User): void {
    user ? this.userSource.next({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    }) : this.userSource.next(this.emptyUser);
  };

  changeProfileData(user): void {
    this.profileDataSource.next(user);
  };

  logout(): void {
    this.authToken = null;
    this.changeUser(null);
    localStorage.clear();
  };
}
