"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface Thread {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
}

export function ThreadCard({ thread }: { thread: Thread }) {
  const { data: session } = useSession();
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const userId = session?.user?.id;
      const url = `/api/posts/${thread.id}/likes${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`;
      const res = await fetch(url);
      if (!mounted) return;
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
        setLiked(Boolean(data.liked));
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [thread.id, session?.user?.id]);
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl line-clamp-2">{thread.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={thread.authorImage || ""} />
            <AvatarFallback>
              {thread.authorName?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <CardDescription>
            {thread.authorName || "Anonymous"} •{" "}
            <span suppressHydrationWarning>
              {new Date(thread.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Normally we wouldn't raw output HTML safely, but for MVP tiptap viewing: */}
        <div
          className="prose dark:prose-invert max-w-none line-clamp-3 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: thread.content }}
        />
        <div className="mt-4 flex items-center gap-2 cursor-pointer">
          <Button
            size="sm"
            variant={liked ? "destructive" : "ghost"}
            onClick={async () => {
              const userId = session?.user?.id;
              if (!userId) return;
              const res = await fetch(`/api/posts/${thread.id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });
              if (res.ok) {
                const data = await res.json();
                setLiked(Boolean(data.liked));
                setCount(data.count ?? 0);
              }
            }}
          >
            {liked ? "Liked" : "Like"} ({count})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
