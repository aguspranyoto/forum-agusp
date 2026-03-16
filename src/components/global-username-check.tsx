"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function GlobalUsernameCheck() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // If auth is loading, not logged in, or already on edit profile, do nothing
    if (isPending || !session?.user || pathname === "/profile/edit") {
      return;
    }

    // Otherwise, check if user has a username setup
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not ok");
        return res.json();
      })
      .then((data) => {
        if (!data.username) {
          router.push("/profile/edit");
        }
      })
      .catch((err) => {
        // Handle error gracefully, could mean not found
      });
  }, [session, isPending, pathname, router]);

  return null;
}

