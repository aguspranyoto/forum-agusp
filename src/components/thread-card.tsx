"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

interface Thread {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  authorUsername: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function ThreadCard({ thread }: { thread: Thread }) {
  const { data: session } = useSession();
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);

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
        // fetch comment count
        try {
          const cRes = await fetch(`/api/posts/${thread.id}/comments`);
          if (cRes.ok) {
            const cData = await cRes.json();
            setCommentCount(Array.isArray(cData) ? cData.length : 0);
          }
        } catch (e) {
          setCommentCount(0);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [thread.id, session?.user?.id]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/posts/${thread.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !session?.user) return;

    const res = await fetch(`/api/posts/${thread.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        content: commentText.trim(),
      }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl line-clamp-2">{thread.title}</CardTitle>
        </div>
        <Link
          href={`/profile/${thread.authorUsername}`}
          className="flex items-center gap-2 mt-2 cursor-pointer"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={thread.authorImage || ""} />
            <AvatarFallback>
              {thread.authorName?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <CardDescription>
            {thread.authorName || "Anonymous"}{" "}
            <span suppressHydrationWarning>
              {new Date(thread.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </CardDescription>
        </Link>
      </CardHeader>
      <CardContent>
        <div
          className="prose dark:prose-invert max-w-none line-clamp-3 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: thread.content }}
        />
        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            disabled={!session?.user}
            className="cursor-pointer"
            variant={liked ? "outline" : "default"}
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

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowComments(!showComments)}
          >
            Comments ({commentCount})
          </Button>
        </div>
      </CardContent>

      {showComments && (
        <CardFooter className="flex flex-col items-stretch pt-0 pb-4 gap-4 border-t border-border/50 mt-4 px-6 pt-4">
          {session?.user ? (
            <form onSubmit={handlePostComment} className="flex gap-2 w-full">
              <Input
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!commentText.trim()}>
                Post
              </Button>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground">
              Sign in to comment.
            </div>
          )}

          <div className="flex flex-col gap-4 w-full mt-2">
            {isLoadingComments ? (
              <div className="text-sm text-center text-muted-foreground p-2">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-center text-muted-foreground p-2">
                No comments yet.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src={comment.user.image || ""} />
                    <AvatarFallback>
                      {comment.user.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {comment.user.name || "Anonymous"}
                      </span>
                      <span
                        className="text-xs text-muted-foreground"
                        suppressHydrationWarning
                      >
                        {new Date(comment.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
