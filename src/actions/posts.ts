"use server";

import { db } from "@/db";
import { posts, user, usernames } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { desc, eq } from "drizzle-orm";

export async function createThread(title: string, content: string) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  const userId = session?.user?.id;

  if (!userId) {
    // For MVP testing without full auth enforced, normally you'd throw an error:
    // throw new Error("Unauthorized");
    console.warn(
      "MVP Mode: User not authenticated, this will fail if 'anonymous' user doesn't exist in DB.",
    );
  }

  const [newPost] = await db
    .insert(posts)
    .values({
      id: crypto.randomUUID(),
      title,
      content,
      authorId: userId || "anonymous-mvp-user",
      createdAt: new Date(),
    })
    .returning();

  revalidatePath("/");
  return newPost;
}

export async function getThreads(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  // We fetch posts and join their authors
  const results = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: user.name,
      authorImage: user.image,
      authorUsername: usernames.username,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .leftJoin(usernames, eq(user.id, usernames.userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}
