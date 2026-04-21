export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  publishDate: string; // "YYYY-MM-DD"
  thumbnail: string;   // Supabase Storage URL or ""
  excerpt: string;     // ~150 char preview text
  content: string;     // Raw markdown
  youtubeUrl?: string;
  spotifyUrl?: string;
  published: boolean;
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
}

export type PostsApiResponse = { posts: BlogPost[] };
export type PostApiResponse = { post: BlogPost };
export type ApiError = { error: string };
