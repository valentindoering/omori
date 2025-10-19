import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface DeleteArticleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  articleTitle?: string;
}

export function DeleteArticleDialog({
  isOpen,
  onClose,
  onConfirm,
  articleTitle = "this article",
}: DeleteArticleDialogProps) {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={onClose}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm p-6 duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <DialogTitle as="h3" className="text-base font-medium text-white">
              Delete article
            </DialogTitle>
            <p className="mt-2 text-sm text-white/50">
              Are you sure you want to delete {articleTitle}? This action cannot
              be undone and all content will be permanently lost.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <Button
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white focus:not-data-focus:outline-none data-hover:bg-white/15 transition-colors"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white focus:not-data-focus:outline-none data-hover:bg-red-700 transition-colors"
                onClick={onConfirm}
              >
                Delete
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

