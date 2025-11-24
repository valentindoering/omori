/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiReflection from "../aiReflection.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as embeddings from "../embeddings.js";
import type * as embeddings_qm from "../embeddings_qm.js";
import type * as http from "../http.js";
import type * as notion from "../notion.js";
import type * as notionApi from "../notionApi.js";
import type * as notionOAuth from "../notionOAuth.js";
import type * as notionOAuthState from "../notionOAuthState.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiReflection: typeof aiReflection;
  articles: typeof articles;
  auth: typeof auth;
  embeddings: typeof embeddings;
  embeddings_qm: typeof embeddings_qm;
  http: typeof http;
  notion: typeof notion;
  notionApi: typeof notionApi;
  notionOAuth: typeof notionOAuth;
  notionOAuthState: typeof notionOAuthState;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
