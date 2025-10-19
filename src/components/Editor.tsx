"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

/**
 * TipTap editor component with auto-save functionality.
 * 
 * Features:
 * - Dark mode styling
 * - Clean, Notion-like appearance
 * - Auto-save on debounce (1 second after typing stops)
 * - Periodic auto-save (every 30 seconds)
 */

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  editorRef?: React.MutableRefObject<ReturnType<typeof useEditor> | null>;
}

export function Editor({ content, onUpdate, editorRef }: EditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const periodicSaveRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const editor = useEditor({
    extensions: [StarterKit],
    content: JSON.parse(content),
    immediatelyRender: false, // Required for Next.js SSR to avoid hydration mismatches
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[60vh] px-8 py-8",
      },
    },
    onUpdate: ({ editor }) => {
      // Clear existing debounce timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Save after 1 second of no typing
      saveTimeoutRef.current = setTimeout(() => {
        const json = editor.getJSON();
        onUpdate(JSON.stringify(json));
      }, 1000);
    },
  });

  // Expose editor instance to parent via ref
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // Periodic save every 30 seconds
  useEffect(() => {
    periodicSaveRef.current = setInterval(() => {
      if (editor) {
        const json = editor.getJSON();
        onUpdate(JSON.stringify(json));
      }
    }, 30000);

    return () => {
      if (periodicSaveRef.current) {
        clearInterval(periodicSaveRef.current);
      }
    };
  }, [editor, onUpdate]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (editor) {
        const json = editor.getJSON();
        onUpdate(JSON.stringify(json));
      }
    };
  }, [editor, onUpdate]);

  return <EditorContent editor={editor} />;
}

