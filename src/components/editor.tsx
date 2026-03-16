"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useState } from "react";
import { MediaChooser } from "./media-chooser";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, 
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, 
  CheckSquare, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Link as LinkIcon, Undo, Redo, Image as ImageIcon 
} from "lucide-react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuButton = ({ onClick, isActive, disabled, children }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded hover:bg-muted transition-colors ${
      isActive ? "bg-muted text-foreground font-medium" : "text-muted-foreground"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange }: EditorProps) {
  const [mediaChooserOpen, setMediaChooserOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit, 
      TiptapImage,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-5 focus:outline-none min-h-[200px] w-full max-w-full",
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

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="border rounded-md bg-background flex flex-col flex-1 h-full overflow-hidden">
      <MediaChooser
        open={mediaChooserOpen}
        onOpenChange={setMediaChooserOpen}
        onSelect={setMedia}
      />
      <div className="flex gap-1 p-2 border-b flex-wrap shrink-0 items-center bg-muted/30">
        <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")}>
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")}>
          <Strikethrough className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")}>
          <Code className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}>
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })}>
          <Heading3 className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")}>
          <CheckSquare className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")}>
          <Quote className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}>
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}>
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}>
          <AlignRight className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}>
          <AlignJustify className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />
        
        <MenuButton onClick={setLink} isActive={editor.isActive("link")}>
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        
        <MenuButton onClick={() => setMediaChooserOpen(true)}>
          <ImageIcon className="w-4 h-4" />
        </MenuButton>
      </div>
      <div className="flex-1 overflow-y-auto w-full cursor-text pb-4" onClick={() => {
        if (editor) editor.chain().focus().run();
      }}>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
