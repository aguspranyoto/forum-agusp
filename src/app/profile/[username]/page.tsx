import SendMessageButton from "@/components/send-message-button";
import { db } from "@/db";
import {
  user as userTable,
  usernames as usernamesTable,
  posts,
  comments,
  likes,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      image: userTable.image,
      username: usernamesTable.username,
    })
    .from(userTable)
    .innerJoin(usernamesTable, eq(userTable.id, usernamesTable.userId))
    .where(eq(usernamesTable.username, String(username)))
    .get();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-xl font-semibold">User not found</h2>
        <p className="text-muted-foreground mt-2">
          No user with username {username}.
        </p>
      </div>
    );
  }

  const recentPosts = await db
    .select({ id: posts.id, title: posts.title, createdAt: posts.createdAt })
    .from(posts)
    .where(eq(posts.authorId, user.id))
    .orderBy(desc(posts.createdAt))
    .limit(5);

  const recentComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      postId: comments.postId,
      postTitle: posts.title,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(posts, eq(comments.postId, posts.id))
    .where(eq(comments.userId, user.id))
    .orderBy(desc(comments.createdAt))
    .limit(5);

  const recentLikes = await db
    .select({
      id: likes.id,
      postId: likes.postId,
      postTitle: posts.title,
      createdAt: likes.createdAt,
    })
    .from(likes)
    .leftJoin(posts, eq(likes.postId, posts.id))
    .where(eq(likes.userId, user.id))
    .orderBy(desc(likes.createdAt))
    .limit(5);

  const formatDate = (ts: any) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  };

  return (
    <div className="max-w-5xl px-4 mx-auto py-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-muted">
            {user.image ? (
              // next/image requires a loader or allowed domains; using plain img fallback
              <img
                src={user.image}
                alt={user.name || username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-xl">
                {(user.name || username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{user.name || username}</h1>
            <div className="text-sm text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div>
        <div className="pointer-events-none">
          <SendMessageButton userId={user.id} userName={user.name} />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Activity</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <h3 className="text-sm font-medium">Posts</h3>
            <div className="mt-2 space-y-2 text-sm">
              {recentPosts.length === 0 ? (
                <div className="text-muted-foreground">No posts yet.</div>
              ) : (
                recentPosts.map((p) => (
                  <div key={p.id} className="p-2 rounded-md hover:bg-accent/50">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {formatDate(p.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Comments</h3>
            <div className="mt-2 space-y-2 text-sm">
              {recentComments.length === 0 ? (
                <div className="text-muted-foreground">No comments yet.</div>
              ) : (
                recentComments.map((c) => (
                  <div key={c.id} className="p-2 rounded-md hover:bg-accent/50">
                    <div className="text-muted-foreground text-xs">
                      on: {c.postTitle || c.postId}
                    </div>
                    <div className="mt-1">{c.content}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {formatDate(c.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Likes</h3>
            <div className="mt-2 space-y-2 text-sm">
              {recentLikes.length === 0 ? (
                <div className="text-muted-foreground">No likes yet.</div>
              ) : (
                recentLikes.map((l) => (
                  <div key={l.id} className="p-2 rounded-md hover:bg-accent/50">
                    <div className="text-muted-foreground text-xs">liked:</div>
                    <div className="mt-1">{l.postTitle || l.postId}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {formatDate(l.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
