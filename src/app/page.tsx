"use client";

import ArticleList from "./ArticleList";
import { AuthWrapper } from "@/components/AuthWrapper";

export default function Home() {
  return (
    <AuthWrapper>
      <ArticleList />
    </AuthWrapper>
  );
}