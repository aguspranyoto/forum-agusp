"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { AuthDialog } from "./auth-dialog";
import { useState, useEffect } from "react";
import Link from "next/link";

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
              <div className="flex items-center gap-3">
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
                  <PopoverContent className={"w-52!"} align="start">
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
