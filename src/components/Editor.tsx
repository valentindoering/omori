"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  onStatusChange?: (status: 'idle' | 'typing' | 'saving' | 'saved') => void;
  editorRef?: { current: ReturnType<typeof useEditor> | null };
}

export function Editor({ content, onUpdate, onStatusChange, editorRef }: EditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const editor = useEditor({
    extensions: [StarterKit],
    content: JSON.parse(content),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[60vh] px-8",
      },
    },
    onUpdate: ({ editor }) => {
      onStatusChange?.('typing');
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onStatusChange?.('saving');
        onUpdate(JSON.stringify(editor.getJSON()));
      }, 1000);
    },
  });

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
  }, [editor, editorRef]);

  return <EditorContent editor={editor} />;
}

