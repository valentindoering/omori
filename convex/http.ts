import { httpRouter } from "convex/server";
import { auth } from "./auth";

/**
 * HTTP router configuration.
 * 
 * This sets up the HTTP endpoints for authentication.
 * The auth.addHttpRoutes() method registers all necessary OAuth endpoints.
 */
const http = httpRouter();

auth.addHttpRoutes(http);

export default http;

