"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

function Profile() {
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // If a file was selected, upload it and use returned URL
      if (file && session?.user) {
        const fd = new FormData();
        fd.append("file", file);
        // choose a stable identifier for the filename (user id or email)
        const userId = session.user.id || session.user.email || "user";
        fd.append("userId", String(userId));

        const res = await fetch("/api/profile/upload", {
          method: "POST",
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          setImage(data.url);
          // notify other parts of the app (e.g. navbar) to update
          try {
            window.dispatchEvent(
              new CustomEvent("profile:updated", {
                detail: { image: data.url },
              }),
            );
          } catch (e) {
            // ignore in SSR or environments without window
          }
        }
      }

      // persist `name` and `image` in your user database
      try {
        const userId = session?.user?.id || session?.user?.email || "";
        if (userId) {
          await fetch("/api/profile/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, name, image }),
          });
        }
      } catch (err) {
        console.error("Failed to persist profile changes", err);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen bg-background max-w-5xl mx-auto px-4 py-8">
      <main className="grow min-w-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold">Edit Profile</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 max-w-xl">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="mb-1">Display Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2">Profile Image</Label>
            <Avatar className="h-32 w-32">
              {previewUrl || image ? (
                <AvatarImage src={previewUrl ?? image} />
              ) : (
                <AvatarFallback>
                  {name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                id="profile-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>
                <span className="text-sm text-muted-foreground">
                  {file?.name ?? "No file selected"}
                </span>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-12 w-12 rounded-md object-cover ml-2"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </main>

      <aside className="hidden lg:block w-64 ml-8 flex-shrink-0">
        <div className="p-4 border rounded-lg bg-muted/50">
          <h2 className="text-lg font-medium mb-2">Profile Page</h2>
          <p className="text-muted-foreground text-sm">
            You can view and edit your profile information here.
          </p>
        </div>
      </aside>
    </div>
  );
}

export default Profile;
