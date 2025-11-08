import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import ArticleList from "./ArticleList";

export default async function Home() {
  const token = await convexAuthNextjsToken();
  
  // Preload the initial page of articles
  const preloadedArticles = await preloadQuery(
    api.articles.listArticles,
    {
      paginationOpts: { numItems: 20, cursor: null },
      search: undefined,
    },
    { token }
  );

  return <ArticleList preloadedArticles={preloadedArticles} />;
}