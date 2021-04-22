import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { ProfilePreview } from '../interfaces/profile-preview';

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
  
  private searchResultsSource = new BehaviorSubject<ProfilePreview[]>([]);
  searchResults = this.searchResultsSource.asObservable();
  private searchTermSource = new BehaviorSubject('');
  currentSearchTerm = this.searchTermSource.asObservable();
  private endOfResultsSource = new BehaviorSubject<boolean>(false);
  endOfResults = this.endOfResultsSource.asObservable();

  constructor(private http: HttpClient) { }

  getUsers(term: object, start: number) {
    return this.http.post(`${this.api}/search?start=${start}`, term, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

// ======================
// || Reset to Default ||
// ======================

  resetSearch(): void {
    this.changeSearchResults([]);
    this.changeEndOfResults(false);
  };

  clearSearchBar(location: string, form: any): void {
    $(`#${location}`).val('');
    form.value.searchTerm = '';
  };

// ========================
// || Change Observables ||
// ========================

  changeSearchResults(list: any[]): void {
    this.searchResultsSource.next(list);
  };

  changeSearchTerm(term: string): void {
    this.searchTermSource.next(term);
  };

  changeEndOfResults(status: boolean): void {
    this.endOfResultsSource.next(status);
  };
}
