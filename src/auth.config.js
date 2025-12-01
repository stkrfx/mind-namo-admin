/**
 * This file is used by Middleware (Edge Compatible).
 * We separate it from auth.js to avoid "Module not found: mongoose" errors in Middleware.
 */
export default {
    pages: {
      signIn: "/login", // Redirect unauthenticated users here
      error: "/login",  // Redirect auth errors here
    },
    callbacks: {
      // 1. Authorized: Controls who can access protected routes
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        
        // We assume Middleware handles the specific route matching (dashboard vs login)
        // This callback just returns true/false for the current session status
        // relative to the page being accessed if used directly by NextAuth middleware.
        // In our custom middleware.js (File 3), we handle the redirection logic manually
        // for finer control, so we simply return true here to avoid double-redirect issues.
        return true;
      },
  
      // 2. JWT: Runs whenever a token is created or updated
      async jwt({ token, user, trigger, session }) {
        if (user) {
          // User object is available only on first sign in
          token.id = user.id;
          token.role = user.role;
          token.email = user.email;
          token.picture = user.image;
          token.requiresPasswordChange = user.requiresPasswordChange; // For Organization flow
        }
  
        // Allow client-side updates (e.g. after profile edit)
        if (trigger === "update" && session) {
          token = { ...token, ...session };
        }
  
        return token;
      },
  
      // 3. Session: Passes token data to the client-side session
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id;
          session.user.role = token.role;
          session.user.email = token.email;
          session.user.image = token.picture; // Ensure image propagates
          session.user.requiresPasswordChange = token.requiresPasswordChange;
        }
        return session;
      },
    },
    providers: [], // Providers are configured in auth.js (Server-side)
  };