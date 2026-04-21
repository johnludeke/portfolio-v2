import { supabase } from "./supabase";
import type { BlogPost } from "./types";

// Maps Supabase snake_case rows to camelCase BlogPost
function rowToPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    publishDate: row.publish_date as string,
    thumbnail: (row.thumbnail as string) ?? "",
    excerpt: (row.excerpt as string) ?? "",
    content: (row.content as string) ?? "",
    youtubeUrl: (row.youtube_url as string) ?? undefined,
    spotifyUrl: (row.spotify_url as string) ?? undefined,
    published: row.published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPost);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("publish_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return rowToPost(data);
}

export async function createPost(
  input: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      slug: input.slug,
      publish_date: input.publishDate || null,
      thumbnail: input.thumbnail ?? "",
      excerpt: input.excerpt ?? "",
      content: input.content ?? "",
      youtube_url: input.youtubeUrl ?? null,
      spotify_url: input.spotifyUrl ?? null,
      published: input.published ?? false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToPost(data);
}

export async function updatePost(
  slug: string,
  input: Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt">>
): Promise<BlogPost> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.publishDate !== undefined) updateData.publish_date = input.publishDate || null;
  if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail;
  if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.youtubeUrl !== undefined) updateData.youtube_url = input.youtubeUrl || null;
  if (input.spotifyUrl !== undefined) updateData.spotify_url = input.spotifyUrl || null;
  if (input.published !== undefined) updateData.published = input.published;

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToPost(data);
}

export async function deletePost(slug: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}
