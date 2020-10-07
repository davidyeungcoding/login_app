import { Component, OnInit } from '@angular/core';

import { Post } from '../../post';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  storedPosts: Post[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  onPostAdded(post) {
    this.storedPosts.push(post);
  }

}
