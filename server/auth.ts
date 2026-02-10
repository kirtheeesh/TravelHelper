import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import type { Express } from "express";
import { User } from "@shared/schema";

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = process.env.AUTH_REDIRECT_URL || (process.env.NODE_ENV === "production"
      ? "https://travelhelper-iq3t.onrender.com/api/auth/google/callback"
      : "http://127.0.0.1:5000/api/auth/google/callback");

    console.log(`Google Auth initialized with callback: ${callbackURL}`);
    console.log(`Google Client ID (first 15 chars): ${process.env.GOOGLE_CLIENT_ID?.substring(0, 15)}...`);

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
          proxy: true,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            console.log(`Verifying Google profile: ${profile.displayName} (${profile.id})`);
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              console.log("Creating new user from Google profile...");
              user = await storage.createUser({
                username: profile.emails?.[0].value || profile.id,
                name: profile.displayName,
                email: profile.emails?.[0].value,
                googleId: profile.id,
                avatar: profile.photos?.[0].value,
                isOnline: true,
              });
              console.log(`User created: ${user.username}`);
            } else {
              console.log(`User found: ${user.username}`);
            }

            return done(null, user);
          } catch (err) {
            console.error("Error in Google Strategy verify callback:", err);
            return done(err as Error);
          }
        }
      )
    );
  }
}
