"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImage, getUserImages } from "@/actions/media";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

interface MediaChooserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export function MediaChooser({
  open,
  onOpenChange,
  onSelect,
}: MediaChooserProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["user-images"],
    queryFn: async () => {
      const data = await getUserImages();
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const formData = new FormData();
      formData.append("file", uploadFile);
      return await uploadImage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-images"] });
      setFile(null);
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Upload new media or choose from your existing uploaded images.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">My Images</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : images?.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <p>No images found.</p>
                  <p className="text-sm">
                    Upload some images to see them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 lg:grid-cols-4">
                  {images?.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted hover:border-primary"
                      onClick={() => onSelect(img.url)}
                    >
                      <Image
                        src={img.url}
                        alt="User uploaded media"
                        fill
                        className="object-cover transition-all group-hover:scale-105"
                        sizes="(max-width: 768px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="max-w-xs"
              />
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUpload(e as any);
                }}
                disabled={!file || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
