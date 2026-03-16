"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

function Profile() {
  const { data: session, isPending } = useSession();

  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsername, setIsUsername] = useState<boolean | null>(null);

  const schema = z.object({
    username: z
      .string()
      .min(1, "Username is required")
      .regex(/^[a-z0-9_]+$/, "Letters, numbers and underscores only"),
    name: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", name: "" },
  });

  const watchName = watch("name");

  useEffect(() => {
    if (session?.user) {
      // Fetch full profile info to get username
      fetch("/api/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setValue("name", data.name);
          if (data.image) setImage(data.image);
          if (data.username) {
            setUsername(data.username);
            setValue("username", data.username);
          }
          setIsUsername(!!data.username);
        })
        .catch(console.error);
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

  async function onSubmit(values: FormValues) {
    setSaving(true);
    let imageToSave = image;
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
          imageToSave = data.url;
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

      // persist `name`, `username`, and `image` in your user database
      try {
        setError(null);

        const userId = session?.user?.id || session?.user?.email || "";
        if (userId) {
          const res = await fetch("/api/profile/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              name: values.name || watchName || "",
              username: values.username,
              image: imageToSave,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Update failed");
          }
          // Force a hard refresh to re-evaluate the layout's server-side block
          window.location.href = `/profile/${values.username}`;
        }
      } catch (err: any) {
        console.error("Failed to persist profile changes", err);
        setError(err.message || "Failed to persist changes");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen bg-background max-w-5xl mx-auto px-4 py-8">
      <main className="grow min-w-0">
        <Card className="max-w-3xl">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription className="text-sm">
                  Update your profile details — username, display name, and
                  profile image.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isUsername === false && (
              <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                <AlertTriangleIcon />
                <AlertTitle>Create a username</AlertTitle>
                <AlertDescription>
                  Please fill out your new username and click "Save" to update
                  your profile. Your new username will be visible to others and
                  used in your profile URL.
                </AlertDescription>
              </Alert>
            )}

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {isPending ? (
              <div className="w-full h-24 flex justify-center items-center">
                <LoaderCircle className="text-slate-600 w-12 h-12 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label className="mb-2">Username</Label>
                    <Input
                      {...register("username", {
                        onChange: (e: ChangeEvent<HTMLInputElement>) =>
                          setUsername(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, ""),
                          ),
                      })}
                      placeholder="Unique username"
                      required
                      disabled={isUsername === true}
                    />
                    {errors.username ? (
                      <p className="text-sm text-destructive mt-1">
                        {(errors.username.message as string) ||
                          "Invalid username"}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Letters, numbers, and underscores only.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-2">Display Name</Label>
                    <Input {...register("name")} placeholder="Your name" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                      {previewUrl || image ? (
                        <AvatarImage src={previewUrl ?? image} />
                      ) : (
                        <AvatarFallback>
                          {watchName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
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
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  // reset to current values
                  setValue("username", username || "");
                }}
                className="mr-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={() =>
                  document
                    .querySelector("form")
                    ?.requestSubmit()
                }
                disabled={isSubmitting || saving || (!isDirty && file === null)}
              >
                {isSubmitting || saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>

      <aside className="hidden lg:block w-64 ml-8 shrink-0">
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
