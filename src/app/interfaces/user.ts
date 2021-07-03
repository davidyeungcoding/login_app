import { Post } from './post';
import { ProfilePreview } from './profile-preview';

export interface User {
  _id: string,
  username: string,
  name: string,
  bannerImage: any,
  profileImage: any,
  email: string,
  postCount: number,
  posts: Post[],
  followerCount: number,
  followers: ProfilePreview[],
  followingCount: number,
  following: ProfilePreview[],
  mentions: Post[],
  mentionsCount: number
}
