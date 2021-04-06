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
  private localUser = JSON.parse(localStorage.getItem('user'));
  emptyUser = {
    id: false,
    username: false,
    name: false,
    email: false
  };
  api = 'http://localhost:3000/users';

  private userSource = new BehaviorSubject<any>(this.localUser ? this.localUser : this.emptyUser);
  currentUser = this.userSource.asObservable();
  private profileDataSource = new BehaviorSubject<any>({});
  profileData = this.profileDataSource.asObservable();

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

  followUser(payload) {
    return this.http.put(`${this.api}/profile/${payload.profileUsername}/follow`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  unfollow(payload) {
    return this.http.put(`${this.api}/profile/${payload.profileUsername}/unfollow`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

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

  isExpired() {
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

  personalProfile(currentUser, profileUser): boolean {
    return currentUser.id && !this.isExpired()
    && currentUser.username === profileUser.username ? true : false;
  };

  visitingProfile(currentUser, profileUser): boolean {
    return currentUser.id && !this.isExpired()
    && currentUser.username !== profileUser.username ? true : false;
  };

  logout(): void {
    this.authToken = null;
    this.changeUser(null);
    localStorage.clear();
  };
}
