import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import { Post } from '../../post';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  toAddContent: string = '';
  @Output() postCreated = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onAddPost() {
    this.toAddContent = this.toAddContent.trim();
    
    if (this.toAddContent.length) {
      const post: Post = {
        date: new Date().toLocaleString(),
        content: this.toAddContent
      };
      this.postCreated.emit(post);
    };
    this.toAddContent = '';
  }

}
