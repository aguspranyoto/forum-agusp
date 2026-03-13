"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { useState } from "react";
import { MediaChooser } from "./media-chooser";
import { Image as ImageIcon } from "lucide-react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: EditorProps) {
  const [mediaChooserOpen, setMediaChooserOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, TiptapImage],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-5 focus:outline-none min-h-[150px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setMedia = (url: string) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setMediaChooserOpen(false);
  };

  return (
    <div className="border rounded-md p-2 bg-background flex flex-col flex-1 h-full overflow-hidden">
      <MediaChooser
        open={mediaChooserOpen}
        onOpenChange={setMediaChooserOpen}
        onSelect={setMedia}
      />
      <div className="flex gap-2 mb-2 border-b pb-2 flex-wrap shrink-0">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded ${editor?.isActive("bold") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded ${editor?.isActive("italic") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-2 py-1 text-sm rounded ${editor?.isActive("heading", { level: 2 }) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => setMediaChooserOpen(true)}
          className="px-2 py-1 text-sm rounded hover:bg-muted ml-auto flex items-center gap-1"
        >
          <ImageIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Image</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto w-full">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
