"use client";

import React from "react";
import { Button } from "./ui/button";

export default function SendMessageButton({
  userId,
  userName,
}: {
  userId: string;
  userName?: string | null;
}) {
  const handleOpen = () => {
    const ev = new CustomEvent("open-chat", {
      detail: { receiverId: userId, receiverName: userName ?? null },
    });
    window.dispatchEvent(ev);
  };

  return (
    <Button size="sm" variant="default" onClick={handleOpen}>
      Send a message
    </Button>
  );
}
