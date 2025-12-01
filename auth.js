import NextAuth, { AuthError } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";
import Organisation from "@/lib/models/Organisation";
import { verifyPassword } from "@/lib/password";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();
        const email = credentials.email.toLowerCase();

        // 1. Check if user is an ADMIN
        let user = await Admin.findOne({ email }).select("+password");
        let role = "admin";

        // 2. If not Admin, check if user is an ORGANISATION
        if (!user) {
          user = await Organisation.findOne({ email }).select("+password");
          role = "organisation";
        }

        // 3. If neither, deny access (No registration allowed)
        if (!user) {
          throw new AuthError("Account not found.");
        }

        // 4. Verify Password
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials.");
        }

        // 5. Return User Object (Stored in JWT)
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: role,
          requiresPasswordChange: user.requiresPasswordChange || false,
        };
      },
    }),
  ],
  callbacks: {
    // Check if user is allowed to sign in (Used for Google OAuth mainly)
    async signIn({ user, account, profile }) {
      // Allow Credentials login to pass through (logic handled in authorize)
      if (account?.provider === "credentials") return true;

      if (account?.provider === "google") {
        await connectDB();
        const email = user.email.toLowerCase();

        // Only ADMINS can use Google Login in this portal
        const admin = await Admin.findOne({ email });

        if (!admin) {
          // Deny login if email doesn't exist in Admin DB
          return false; 
        }

        // Update Google ID if not set
        if (!admin.googleId) {
          admin.googleId = account.providerAccountId;
          await admin.save();
        }

        // Update Profile Picture if missing in DB
        if (!admin.image && user.image) {
          admin.image = user.image;
          await admin.save();
        }

        // Merge DB data into the user object for the session
        user.role = "admin";
        user.id = admin._id.toString();
        return true;
      }

      return false; // Fallback deny
    },
    
    // Extend the jwt/session callbacks from auth.config.js
    // We import the config and spread it, but we can override if needed.
    // Since we defined the logic in auth.config.js, it is automatically applied 
    // because we spread `...authConfig` in the NextAuth options above.
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
});