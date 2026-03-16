"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircle, X, Minus } from "lucide-react";

export function ChatWidget() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for messages
  useEffect(() => {
    let mounted = true;
    async function fetchMessages() {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setMessages(data);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (isOpen && !isMinimized) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000); // 2 second polling for live feel
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !session?.user) return;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, content: text.trim() }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isPending) return null;
  if (!session?.user) return null;

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-xl z-50 cursor-pointer"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed right-4 sm:right-8 z-50 flex flex-col bg-background border border-border shadow-2xl rounded-t-lg transition-all duration-300 ease-in-out w-[320px] ${
        isMinimized ? "bottom-0 h-12" : "bottom-0 h-[400px]"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between h-12 px-3 border-b bg-primary text-primary-foreground rounded-t-lg cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 border border-primary-foreground/20">
            <AvatarImage src={session.user.image || ""} />
            <AvatarFallback className="text-foreground">
              {session.user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">Global Chat Room</span>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground mt-4">
                No messages yet. Say hi!
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?.id === session.user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                      <AvatarImage src={msg.sender?.image || ""} />
                      <AvatarFallback>
                        {msg.sender?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] text-muted-foreground mb-0.5">
                        {msg.sender?.name}
                      </span>
                      <div
                        className={`px-3 py-1.5 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-3 border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 text-sm h-9"
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 cursor-pointer"
                disabled={!text.trim()}
              >
                Send
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
