"use client";

import Import from "./Import";
import { AuthWrapper } from "@/components/AuthWrapper";

export default function ImportPage() {
  return (
    <AuthWrapper>
      <Import />
    </AuthWrapper>
  );
}