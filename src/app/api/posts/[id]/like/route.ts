import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request, context: any) {
  try {
    const rawParams = context?.params ?? context;
    const params =
      typeof rawParams?.then === "function" ? await rawParams : rawParams;
    const postId = params?.id;
    const body = await req.json();
    const userId = body?.userId;

    if (!userId)
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });

    // check existing
    const existing = await db
      .select()
      .from(likes)
      .where(
        and(eq(likes.userId, String(userId)), eq(likes.postId, String(postId))),
      );

    if (existing.length > 0) {
      // remove like
      await db
        .delete(likes)
        .where(
          and(
            eq(likes.userId, String(userId)),
            eq(likes.postId, String(postId)),
          ),
        );
      const countRows = await db
        .select()
        .from(likes)
        .where(eq(likes.postId, String(postId)));
      return new Response(
        JSON.stringify({ liked: false, count: countRows.length }),
        { status: 200 },
      );
    }

    // add like
    await db.insert(likes).values({
      id: crypto.randomUUID(),
      userId: String(userId),
      postId: String(postId),
      createdAt: new Date(),
    });
    const countRows = await db
      .select()
      .from(likes)
      .where(eq(likes.postId, String(postId)));
    return new Response(
      JSON.stringify({ liked: true, count: countRows.length }),
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Like toggle failed" }), {
      status: 500,
    });
  }
}
