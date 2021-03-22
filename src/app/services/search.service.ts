import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  api = 'http://localhost:3000/users';
  
  searchResultsSource = new BehaviorSubject([]);
  searchResults = this.searchResultsSource.asObservable();
  searchTermSource = new BehaviorSubject('');
  currentSearchTerm = this.searchTermSource.asObservable();

  constructor(private http: HttpClient) { }

  getUsers(term: string) {
    return this.http.post(`${this.api}/search`, term, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  changeSearchResults(list: any[]): void {
    this.searchResultsSource.next(list);
  };

  changeSearchTerm(term: string): void {
    this.searchTermSource.next(term);
  };
}
