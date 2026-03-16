import fs from "fs";
import path from "path";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const userId = String(form.get("userId") || "");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const origName = (file as any).name || "upload";
    const ext = path.extname(origName) || ".png";

    const publicDir = path.join(process.cwd(), "public");
    const profilesDir = path.join(publicDir, "profiles");
    if (!fs.existsSync(profilesDir))
      fs.mkdirSync(profilesDir, { recursive: true });

    const filename = `${userId}${ext}`;
    const filepath = path.join(profilesDir, filename);

    // Remove any existing profile files for this user (different extensions)
    try {
      const existing = fs.readdirSync(profilesDir);
      for (const f of existing) {
        if (f.startsWith(`${userId}.`)) {
          try {
            fs.unlinkSync(path.join(profilesDir, f));
          } catch (e) {
            console.error("Failed to remove existing profile file", f, e);
          }
        }
      }
    } catch (e) {
      console.error("Failed to scan profiles dir", e);
    }

    // Write file (overwrite existing)
    fs.writeFileSync(filepath, buffer);

    const url = `/profiles/${filename}`;

    // Persist image URL to user record (best-effort)
    try {
      await db
        .update(userTable)
        .set({ image: url })
        .where(eq(userTable.id, userId));
    } catch (dbErr) {
      console.error("Failed to update user image:", dbErr);
    }

    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
