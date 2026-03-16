import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request, context: any) {
  try {
    const rawParams = context?.params ?? context;
    const params =
      typeof rawParams?.then === "function" ? await rawParams : rawParams;
    const postId = params?.id;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    const rows = await db
      .select()
      .from(likes)
      .where(eq(likes.postId, String(postId)));
    const count = rows.length;
    let liked = false;
    if (userId) {
      const existing = await db
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.userId, String(userId)),
            eq(likes.postId, String(postId)),
          ),
        );
      liked = existing.length > 0;
    }
    return new Response(JSON.stringify({ count, liked }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch likes" }), {
      status: 500,
    });
  }
}
