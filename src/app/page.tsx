"use client";

import ArticleList from "./ArticleList";
import { AuthWrapper } from "@/components/AuthWrapper";
import { NotionOAuthHandler } from "@/components/NotionOAuthHandler";

export default function Home() {
  return (
    <AuthWrapper>
      <NotionOAuthHandler />
      <ArticleList />
    </AuthWrapper>
  );
}