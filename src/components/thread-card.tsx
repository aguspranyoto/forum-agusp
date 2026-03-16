import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  console.log("Rendering ThreadCard for thread:", thread);
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
            {new Date(thread.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Normally we wouldn't raw output HTML safely, but for MVP tiptap viewing: */}
        <div
          className="prose dark:prose-invert max-w-none line-clamp-3 text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: thread.content }}
        />
      </CardContent>
    </Card>
  );
}
