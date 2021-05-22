import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { ProfilePreview } from '../interfaces/profile-preview';

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

// =====================
// || Search Mutation ||
// =====================

  private stepSource = new BehaviorSubject<number>(3);
  step = this.stepSource.asObservable();

  constructor(private http: HttpClient) { }

  getUsers(term: string, start: number) {
    return this.http.get(`${this.api}/search?term=${term}&start=${start}`).pipe(
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
