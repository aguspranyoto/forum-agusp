"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { AuthDialog } from "./auth-dialog";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

function ProfileMenuContent() {
  return (
    <div className="flex flex-col">
      <Link
        href="/profile"
        className="text-sm w-full text-left px-2 py-1 rounded hover:bg-muted/50"
      >
        Profile
      </Link>
    </div>
  );
}

export function Navbar() {
  const { data: session, isPending } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // derive the avatar src from any live override (displayImage) or the session
  const avatarSrc = displayImage ?? session?.user?.image ?? "";

  useEffect(() => {
    function onProfileUpdated(e: Event) {
      const ce = e as CustomEvent<{ image?: string }>;
      const url = ce?.detail?.image;
      if (url) setDisplayImage(url);
    }
    window.addEventListener("profile:updated", onProfileUpdated);
    return () =>
      window.removeEventListener("profile:updated", onProfileUpdated);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchNotifications() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/notifications?userId=${encodeURIComponent(session.user.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setNotifications(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchNotifications();
    
    // Poll for notifications every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [session?.user?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href={"/"} className="flex font-bold text-xl tracking-tight">
            Forum Agusp
          </Link>

          <div className="flex items-center gap-4">
            {isPending ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
            ) : session?.user ? (
              <div className="flex items-center gap-4">
                <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative cursor-pointer">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <h4 className="font-semibold text-sm mb-4">Notifications</h4>
                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="flex gap-3 items-start border-b pb-3 last:border-0 last:pb-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={n.actor?.image || ""} />
                              <AvatarFallback>{n.actor?.name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm leading-tight">
                                <span className="font-medium">{n.actor?.name}</span>{" "}
                                {n.type === "like" ? "liked your post" : "commented on your post"}{" "}
                                <span className="font-medium">"{n.post?.title}"</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarSrc || ""} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:inline-block">
                        {session.user.name}
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className={"w-52!"} align="end">
                    <ProfileMenuContent />
                  </PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
