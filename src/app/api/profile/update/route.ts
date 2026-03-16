import { db } from "@/db";
import { user as userTable, usernames as usernamesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, image, username } = body || {};

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const updateData: Record<string, any> = {};
    if (typeof name === "string") updateData.name = name;
    if (typeof image === "string") updateData.image = image;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(userTable)
        .set(updateData)
        .where(eq(userTable.id, String(userId)));
    }

    if (typeof username === "string" && username.trim().length > 0) {
      // Upsert the username
      await db
        .insert(usernamesTable)
        .values({
          id: String(Date.now()), // Or generate a real UUID
          userId: String(userId),
          username: username.trim(),
        })
        .onConflictDoUpdate({
          target: usernamesTable.userId,
          set: { username: username.trim() },
        });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    if (err?.message?.includes("UNIQUE constraint failed")) {
      return new Response(
        JSON.stringify({ error: "Username already taken." }),
        { status: 400 },
      );
    }
    return new Response(JSON.stringify({ error: "Update failed" }), {
      status: 500,
    });
  }
}
