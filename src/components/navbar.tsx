"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AuthDialog } from "./auth-dialog";
import { useState } from "react";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex font-bold text-xl tracking-tight">
            Forum Agusp
          </div>

          <div className="flex items-center gap-4">
            {isPending ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {session.user.name}
                </span>
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
