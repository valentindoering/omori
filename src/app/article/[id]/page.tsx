"use client";

import Article from "./Article";
import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { AuthWrapper } from "@/components/AuthWrapper";

export default function ArticlePage() {
  const params = useParams();
  const articleId = params.id as Id<"articles">;

  return (
    <AuthWrapper>
      <Article articleId={articleId} />
    </AuthWrapper>
  );
}
