import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Post } from '../../post';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  constructor(public postsService: PostsService) { }

  ngOnInit(): void {
  }

  onAddPost(form: NgForm) {
    const toAddPost = form.value.addContent.trim();
    
    if (toAddPost.length) {
      const post: Post = {
        date: new Date().toLocaleString(),
        content: toAddPost
      };
      this.postsService.addPost(post);
    };
    $('#addContent').val('');
  }

}
