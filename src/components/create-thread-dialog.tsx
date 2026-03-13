"use client";

import { useState } from "react";
import RichTextEditor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createThread } from "@/actions/posts";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { AuthDialog } from "./auth-dialog";

export default function CreateThreadDialog() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      await createThread(title, content);
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setContent("");
      // Real app might trigger a refetch here or let server action's revalidatePath handle it
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !session?.user) {
      setAuthOpen(true);
      return;
    }
    setOpen(newOpen);
  };

  return (
    <>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button size="lg" className="w-full sm:w-auto">
              Start a New Discussion
            </Button>
          }
        />

        <DialogContent className="sm:max-w-5xl h-[70vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Create a New Discussion
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden space-y-4 mt-4 h-full"
          >
            <div className="space-y-2 shrink-0">
              <Label htmlFor="title">Thread Title</Label>
              <Input
                id="title"
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-lg py-6"
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
              <Label className="shrink-0">Content</Label>
              {/* The RichTextEditor uses a portal Dialog for Media which works fine 
                as long as shadcn dialog allows nested dialogs or they are appropriately managed */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </div>

            <div className="flex justify-end pt-4 shrink-0">
              <Button
                type="submit"
                size="lg"
                disabled={
                  !title || submitMutation.isPending || content.length < 5
                }
              >
                {submitMutation.isPending && (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                Post Thread
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
