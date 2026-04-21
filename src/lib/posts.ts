import { supabase } from "./supabase";
import type { BlogPost, Tag } from "./types";
import { slugify } from "./utils";

type TagRow = { tags: { id: string; name: string; slug: string } };

function rowToPost(row: Record<string, unknown>): BlogPost {
  const postTags = (row.post_tags as TagRow[] | null) ?? [];
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    publishDate: row.publish_date as string,
    thumbnail: (row.thumbnail as string) ?? "",
    excerpt: (row.excerpt as string) ?? "",
    content: (row.content as string) ?? "",
    tags: postTags.map((pt) => pt.tags).filter(Boolean),
    published: row.published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const POST_SELECT = "*, post_tags(tag_id, tags(id, name, slug))";

export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPost);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("published", true)
    .order("publish_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return rowToPost(data as Record<string, unknown>);
}

export async function createPost(
  input: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "tags">
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
      published: input.published ?? false,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return rowToPost(data as Record<string, unknown>);
}

export async function updatePost(
  slug: string,
  input: Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "tags">>
): Promise<BlogPost> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.publishDate !== undefined) updateData.publish_date = input.publishDate || null;
  if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail;
  if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.published !== undefined) updateData.published = input.published;

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("slug", slug)
    .select(POST_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return rowToPost(data as Record<string, unknown>);
}

export async function deletePost(slug: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}

export async function setPostTags(postId: string, tagIds: string[]): Promise<void> {
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (tagIds.length === 0) return;
  const { error } = await supabase
    .from("post_tags")
    .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
  if (error) throw new Error(error.message);
}

// ── Tags ────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTag(name: string): Promise<Tag> {
  const slug = slugify(name);
  const { data, error } = await supabase
    .from("tags")
    .insert({ name: name.trim(), slug })
    .select("id, name, slug")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
