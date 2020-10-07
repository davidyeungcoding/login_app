import { Component, OnInit, Input } from '@angular/core';

import { Post } from '../../post';

@Component({
  selector: 'app-display-post',
  templateUrl: './display-post.component.html',
  styleUrls: ['./display-post.component.css']
})
export class DisplayPostComponent implements OnInit {
  @Input() posts: Post[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
