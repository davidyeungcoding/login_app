import { Post } from './post';

export interface User {
  id: string,
  username: string,
  name: string,
  email: string,
  posts: Post[],
  followerCount: number,
  followers: object,
  following: object
}
