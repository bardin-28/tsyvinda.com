import { API } from '@/api';

export type PostAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  description: string;
  htmlContent: string;
  imageUrl: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
};

export type PostsPage = {
  items: Post[];
  nextCursor: string | null;
};

export type GetPostsParams = {
  cursor?: string;
  limit?: number;
};

export function getPosts(params: GetPostsParams = {}): Promise<PostsPage> {
  const { cursor, limit } = params;
  return API.get<PostsPage>('/posts', {
    params: {
      cursor: cursor ?? undefined,
      limit: limit ?? undefined,
    },
  });
}

export function getPostBySlug(slug: string): Promise<Post> {
  return API.get<Post>(`/posts/${slug}`);
}
