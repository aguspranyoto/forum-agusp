import { db } from "@/db";
import { user as userTable, usernames as usernamesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  return (
    <div className="max-w-5xl px-4 mx-auto py-12">
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
          <div className="text-sm text-muted-foreground">@{user.username}</div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Activity</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Recent posts and activity will appear here.
        </p>
      </section>
    </div>
  );
}
