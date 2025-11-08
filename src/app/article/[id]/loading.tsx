import { Loader2, ChevronLeft, MoreVertical } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-gray-400">
          <ChevronLeft size={24} />
        </div>
        <div className="flex items-center gap-4">
          <Loader2 size={20} className="animate-spin text-gray-400" />
          <div className="text-gray-400">
            <MoreVertical size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="px-8 py-4 space-y-1">
          <div className="mb-2">
            <div className="w-8 h-8 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-12 w-3/4 bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="px-8 py-8">
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

