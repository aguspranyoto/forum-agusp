import { db } from "@/db";
import { comments, notifications, posts, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request, context: any) {
  try {
    const rawParams = context?.params ?? context;
    const params =
      typeof rawParams?.then === "function" ? await rawParams : rawParams;
    const postId = params?.id;

    const data = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(comments)
      .innerJoin(user, eq(comments.userId, user.id))
      .where(eq(comments.postId, String(postId)))
      .orderBy(desc(comments.createdAt));

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch comments" }), {
      status: 500,
    });
  }
}

export async function POST(req: Request, context: any) {
  try {
    const rawParams = context?.params ?? context;
    const params =
      typeof rawParams?.then === "function" ? await rawParams : rawParams;
    const postId = params?.id;
    const body = await req.json();
    const { userId, content } = body;

    if (!userId || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    const commentId = crypto.randomUUID();

    await db.insert(comments).values({
      id: commentId,
      content,
      userId: String(userId),
      postId: String(postId),
      createdAt: new Date(),
    });

    // Handle Notification for the post author
    const postRecord = await db
      .select()
      .from(posts)
      .where(eq(posts.id, String(postId)))
      .limit(1);
    if (postRecord.length > 0 && postRecord[0].authorId !== String(userId)) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: postRecord[0].authorId,
        actorId: String(userId),
        type: "comment",
        postId: String(postId),
        createdAt: new Date(),
      });
    }

    const newComment = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(comments)
      .innerJoin(user, eq(comments.userId, user.id))
      .where(eq(comments.id, commentId));

    return new Response(JSON.stringify(newComment[0]), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to post comment" }), {
      status: 500,
    });
  }
}
