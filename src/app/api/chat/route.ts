import { db } from "@/db";
import { messages, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const data = await db
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
      .innerJoin(user, eq(messages.senderId, user.id));
    // reverse to get chronological
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
    const { userId, content } = body;

    if (!userId || !content) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const messageId = crypto.randomUUID();
    await db.insert(messages).values({
      id: messageId,
      senderId: String(userId),
      content: String(content),
      createdAt: new Date(),
    });

    const newMsg = await db
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
      .where(eq(messages.id, messageId));

    return new Response(JSON.stringify(newMsg[0] || body), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to send msg" }), {
      status: 500,
    });
  }
}
