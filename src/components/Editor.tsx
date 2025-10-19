"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  editorRef?: React.MutableRefObject<ReturnType<typeof useEditor> | null>;
}

export function Editor({ content, onUpdate, editorRef }: EditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const periodicSaveRef = useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [StarterKit],
    content: JSON.parse(content),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[60vh] px-8 py-8",
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onUpdate(JSON.stringify(editor.getJSON()));
      }, 1000);
    },
  });

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
  }, [editor, editorRef]);

  useEffect(() => {
    periodicSaveRef.current = setInterval(() => {
      if (editor) onUpdate(JSON.stringify(editor.getJSON()));
    }, 30000);

    return () => {
      if (periodicSaveRef.current) clearInterval(periodicSaveRef.current);
    };
  }, [editor, onUpdate]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (editor) onUpdate(JSON.stringify(editor.getJSON()));
    };
  }, [editor, onUpdate]);

  return <EditorContent editor={editor} />;
}

