import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private activeListSource = new BehaviorSubject<string>('postList');
  activeList = this.activeListSource.asObservable();
  private activeTabSource = new BehaviorSubject<string>('postTab');
  activeTab = this.activeTabSource.asObservable();
  private dumpMessageSource = new BehaviorSubject<string>('');
  dumpMessage = this.dumpMessageSource.asObservable();

  constructor() { }

  resetVisible(add: string): void {
    $(`#${add}`).addClass('visible');
    $('#postList').removeClass('visible');
    this.changeActiveList('postList');
  };

  resetActiveTab(tab: string): void {
    $(`#${tab}`).removeClass('active-tab');
    $('#postTab').addClass('active-tab');
    this.changeActiveTab('postTab');
  };

// =======================
// || Change Observable ||
// =======================

  changeActiveList(list: string): void {
    this.activeListSource.next(list);
  };
  
  changeActiveTab(tab: string): void {
    this.activeTabSource.next(tab);
  };

  changeDumpMessage(term: string): void {
    this.dumpMessageSource.next(term);
  };
}
