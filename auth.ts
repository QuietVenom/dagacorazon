import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authSecret = process.env.AUTH_SECRET;

/**
 * Auth.js (NextAuth v5) with Google.
 *
 * Reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET automatically from the
 * environment; without them the Google button fails on click, but the app
 * and the /entrar page still work. Once MongoDB is connected, add the
 * adapter (@auth/mongodb-adapter) to persist users and sessions.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/entrar",
  },
  // Placeholder so AUTH_SECRET isn't required in local development. In
  // production, leave it undefined so Auth.js fails explicitly at runtime.
  secret:
    authSecret ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "dagacorazon-dev-secret-cambiar"),
});
