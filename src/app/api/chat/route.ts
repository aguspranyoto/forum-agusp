import { db } from "@/db";
import { messages, user } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const receiverId = url.searchParams.get("receiverId");
    const userId = url.searchParams.get("userId");

    let data;
    if (receiverId && userId) {
      // fetch conversation between userId and receiverId
      data = await db
        .select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          sender: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(messages)
        .innerJoin(user, eq(messages.senderId, user.id))
        .where(
          // (sender = userId AND receiver = receiverId) OR (sender = receiverId AND receiver = userId)
          sql`${messages.senderId} = ${userId} AND ${messages.receiverId} = ${receiverId}`.or(
            sql`${messages.senderId} = ${receiverId} AND ${messages.receiverId} = ${userId}`,
          ),
        );
    } else {
      // fallback: return empty conversation (no global chat)
      data = [];
    }

    // return chronological
    return new Response(JSON.stringify(data.reverse()), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch chat" }), {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, content, receiverId } = body;

    if (!userId || !content) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const messageId = crypto.randomUUID();
    await db.insert(messages).values({
      id: messageId,
      senderId: String(userId),
      receiverId: receiverId ?? null,
      content: String(content),
      createdAt: new Date(),
    });

    const newMsg = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        receiverId: messages.receiverId,
        sender: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(messages)
      .innerJoin(user, eq(messages.senderId, user.id))
      .where(eq(messages.id, messageId));

    return new Response(JSON.stringify(newMsg[0] || body), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to send msg" }), {
      status: 500,
    });
  }
}
