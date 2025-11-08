import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center flex flex-col items-center space-y-4">
        <Image src="/favicon.ico" alt="omori logo" width={32} height={32} className="rounded" />
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    </div>
  );
}

