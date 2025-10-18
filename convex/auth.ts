import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

/**
 * Convex Auth configuration.
 * 
 * This sets up authentication using Google OAuth provider.
 * Users will be able to sign in with their Google account.
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],
});

