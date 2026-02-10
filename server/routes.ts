import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MongoStore from "connect-mongo";

const MONGODB_URI = process.env.MONGODB_URI;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in environment variables");
  }

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "travel-helper-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));

  // === SEED DATA ===
  const existingUser = await storage.getUserByUsername("admin");
  if (!existingUser) {
    const admin = await storage.createUser({
      username: "admin",
      password: "admin123", // In a real app, hash this!
      name: "Admin Traveler",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      isOnline: true,
      lat: 48.8566,
      lng: 2.3522
    });

    // Create a sample trip
    const trip = await storage.createTrip({
      name: "Paris Summer 2024",
      destination: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
      startDate: new Date("2024-06-15"),
      endDate: new Date("2024-06-25"),
      budgetTotal: 5000,
      status: "planned",
    });

    // Add places
    await storage.createPlace({
      tripId: trip.id as string,
      name: "Eiffel Tower",
      lat: 48.8584,
      lng: 2.2945,
      image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?w=400&h=300&fit=crop",
      order: 0,
      type: "attraction",
      description: "Iconic iron lady of Paris"
    });

    await storage.createPlace({
      tripId: trip.id as string,
      name: "Louvre Museum",
      lat: 48.8606,
      lng: 2.3376,
      image: "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?w=400&h=300&fit=crop",
      order: 1,
      type: "attraction",
      description: "World's largest art museum"
    });
  }

  // === AUTH ROUTES ===
  app.post(api.auth.login.path, async (req, res) => {
    const { username, password } = api.auth.login.input.parse(req.body);
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session
    (req.session as any).userId = user.id;
    res.json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  });

  // === API ROUTES ===
  
  // Middleware to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  app.get(api.trips.list.path, requireAuth, async (req, res) => {
    const trips = await storage.getTrips();
    res.json(trips);
  });

  app.get(api.trips.get.path, requireAuth, async (req, res) => {
    const trip = await storage.getTrip(String(req.params.id));
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    
    const places = await storage.getPlaces(trip.id as string);
    const members = await storage.getMembers(trip.id as string);
    
    res.json({ ...trip, places, members });
  });

  app.post(api.trips.create.path, requireAuth, async (req, res) => {
    const input = api.trips.create.input.parse(req.body);
    const trip = await storage.createTrip(input);
    res.status(201).json(trip);
  });

  app.post(api.places.create.path, requireAuth, async (req, res) => {
    const tripId = String(req.params.id);
    const input = api.places.create.input.parse(req.body);
    const place = await storage.createPlace({ ...input, tripId });
    res.status(201).json(place);
  });

  app.get(api.expenses.list.path, requireAuth, async (req, res) => {
    const expenses = await storage.getExpenses(String(req.params.id));
    res.json(expenses);
  });

  app.post(api.expenses.create.path, requireAuth, async (req, res) => {
    const tripId = String(req.params.id);
    const userId = (req.session as any).userId;
    const input = api.expenses.create.input.parse(req.body);
    
    const expense = await storage.createExpense({ ...input, tripId, userId });
    res.status(201).json(expense);
  });

  return httpServer;
}
