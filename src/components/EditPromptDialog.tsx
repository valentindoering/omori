"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";

interface EditPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string | null;
  onSave: (prompt: string) => Promise<void>;
}

const DEFAULT_PROMPT = `Read this article and offer sharp insights or questions that help the author think deeper.
Focus on the ending if relevant.
Always format your response as bullet points (using - or •).
Keep it brief - 2-4 bullet points maximum.
No emojis, no quotes, no preface.`;

export function EditPromptDialog({
  isOpen,
  onClose,
  currentPrompt,
  onSave,
}: EditPromptDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPrompt(currentPrompt || DEFAULT_PROMPT);
  }, [currentPrompt, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(prompt);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Edit AI Prompt
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-1">
                Customize how the AI analyzes your articles
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
            placeholder="Enter your custom prompt..."
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Reset to default
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

