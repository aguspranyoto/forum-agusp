import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, image } = body || {};

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const updateData: Record<string, any> = {};
    if (typeof name === "string") updateData.name = name;
    if (typeof image === "string") updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: "Nothing to update" }), {
        status: 400,
      });
    }

    await db
      .update(userTable)
      .set(updateData)
      .where(eq(userTable.id, String(userId)));

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Update failed" }), {
      status: 500,
    });
  }
}
