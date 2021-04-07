import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private activeTabSource = new BehaviorSubject<string>('postList');
  activeTab = this.activeTabSource.asObservable()

  constructor() { }

  resetVisible(add: string, remove: string): void {
    document.getElementById(add).classList.add('visible');
    document.getElementById(remove).classList.remove('visible');
    this.changeActiveTab('postList');
  };

  changeActiveTab(tab: string): void {
    this.activeTabSource.next(tab);
  };
}
