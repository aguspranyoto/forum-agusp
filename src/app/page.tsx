import CreateThreadDialog from "@/components/create-thread-dialog";
import { getThreads } from "@/actions/posts";
import { ThreadCard } from "@/components/thread-card";

export default async function Home() {
  const threads = await getThreads(1, 10);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen bg-background max-w-5xl mx-auto px-4 py-8">
      <main className="grow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
            <p className="text-muted-foreground">
              Join the conversation with the community.
            </p>
          </div>
          <CreateThreadDialog />
        </div>

        <div className="space-y-4">
          {threads.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-medium">No discussions yet</h3>
              <p className="text-muted-foreground mt-1">
                Be the first to start a conversation!
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          )}
        </div>
      </main>
      <aside className="hidden lg:block lg:flex-none w-64 ml-8">
        <div className="p-4 border rounded-lg bg-muted/50">
          <h2 className="text-lg font-medium mb-2">About</h2>
          <p className="text-muted-foreground text-sm">
            This is a simple discussion forum built with Next.js and Tailwind
            CSS. Feel free to start a new thread or join an existing
            conversation!
          </p>
        </div>
      </aside>
    </div>
  );
}
