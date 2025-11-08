import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import Article from "./Article";
import { Id } from "../../../../convex/_generated/dataModel";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = await convexAuthNextjsToken();
  const { id } = await params;
  const articleId = id as Id<"articles">;

  // Preload the article data
  const preloadedArticle = await preloadQuery(
    api.articles.getArticle,
    { articleId },
    { token }
  );

  return <Article preloadedArticle={preloadedArticle} />;
}
