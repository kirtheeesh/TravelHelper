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
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.AUTH_REDIRECT_URL || "/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              // Create new user if they don't exist
              user = await storage.createUser({
                username: profile.emails?.[0].value || profile.id,
                name: profile.displayName,
                email: profile.emails?.[0].value,
                googleId: profile.id,
                avatar: profile.photos?.[0].value,
                isOnline: true,
              });
            }

            return done(null, user);
          } catch (err) {
            return done(err as Error);
          }
        }
      )
    );
  }
}
