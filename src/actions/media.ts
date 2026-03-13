"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { images } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import { existsSync } from "fs";

export async function uploadImage(formData: FormData) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  // Default to a fallback user if not authenticated for MVP testing without auth
  const userId = session?.user?.id || "anonymous-mvp-user";

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extensions = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${extensions}`;
  // Group uploads by userId for better organization
  const uploadDir = join(process.cwd(), "public", "uploads", userId);

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const publicUrl = `/uploads/${userId}/${fileName}`;

  // Save to DB
  const [newImage] = await db
    .insert(images)
    .values({
      id: crypto.randomUUID(),
      url: publicUrl,
      userId,
      createdAt: new Date(),
    })
    .returning();

  return newImage;
}

export async function getUserImages() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  const userId = session?.user?.id || "anonymous-mvp-user";

  const userImages = await db
    .select()
    .from(images)
    .where(eq(images.userId, userId))
    .orderBy(desc(images.createdAt));

  return userImages;
}
