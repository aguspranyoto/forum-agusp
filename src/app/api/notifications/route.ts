import { db } from "@/db";
import { notifications, user, posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const data = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        actor: {
          name: user.name,
          image: user.image,
        },
        post: {
          id: posts.id,
          title: posts.title,
        },
      })
      .from(notifications)
      .leftJoin(user, eq(notifications.actorId, user.id))
      .leftJoin(posts, eq(notifications.postId, posts.id))
      .where(eq(notifications.userId, String(userId)))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch notifications" }),
      { status: 500 },
    );
  }
}
