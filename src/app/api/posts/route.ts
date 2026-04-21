import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getAllPosts, getPublishedPosts, createPost, setPostTags } from "@/lib/posts";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const posts = session ? await getAllPosts() : await getPublishedPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, slug, publishDate, thumbnail, excerpt, content, published, tagIds } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    const post = await createPost({
      title,
      slug: slugify(slug),
      publishDate: publishDate ?? "",
      thumbnail: thumbnail ?? "",
      excerpt: excerpt ?? "",
      content: content ?? "",
      published: published ?? false,
    });

    if (tagIds?.length) await setPostTags(post.id, tagIds);

    revalidatePath("/blog");

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
