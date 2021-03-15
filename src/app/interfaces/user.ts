import { Post } from './post';

export interface User {
  id: string,
  username: string,
  name: string,
  email: string,
  posts: Post[],
  // following: Array[],
  // followers: Array[]
}
