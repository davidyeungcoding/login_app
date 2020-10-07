import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Post } from '../../post';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  @Output() postCreated = new EventEmitter<Post>();

  constructor() { }

  ngOnInit(): void {
  }

  onAddPost(form: NgForm) {
    let content = form.value.addContent.trim();
    
    if (content.length) {
      const post: Post = {
        date: new Date().toLocaleString(),
        content: form.value.addContent
      };
      this.postCreated.emit(post);
    };
    $('#addContent').val('');
  }

}
