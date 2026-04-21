export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  publishDate: string; // "YYYY-MM-DD"
  thumbnail: string;   // Supabase Storage URL or ""
  excerpt: string;     // ~150 char preview text
  content: string;     // Raw markdown
  tags: Tag[];
  published: boolean;
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
}

export type PostsApiResponse = { posts: BlogPost[] };
export type PostApiResponse = { post: BlogPost };
export type TagsApiResponse = { tags: Tag[] };
export type ApiError = { error: string };
