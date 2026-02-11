import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { User, Trip, Place, Member, Expense } from "./db";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import connectMongo from "connect-mongo";
import { setupAuth } from "./auth";
import passport from "passport";
import { log } from "./log";

const MONGODB_URI = process.env.MONGODB_URI;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in environment variables");
  }

  // Handle different import patterns for connect-mongo
  let MongoStore: any;
  const cm = connectMongo as any;
  if (cm.default && typeof cm.default.create === 'function') {
    MongoStore = cm.default;
  } else if (typeof cm.create === 'function') {
    MongoStore = cm;
  } else if (typeof connectMongo === 'function') {
    MongoStore = connectMongo;
  } else {
    MongoStore = cm;
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

  setupAuth(app);

  // === SEED DATA ===
  try {
    log("checking seed data...");
    const checkStart = Date.now();
    const existingMunnar = await Trip.findOne({ name: "Munnar Tea Gardens" });
    log(`seed check took ${Date.now() - checkStart}ms`);
    
    if (!existingMunnar) {
      log("seeding initial data...");
      const seedStart = Date.now();
      const admin = await storage.createUser({
        username: "admin",
        password: "admin123",
        name: "Kerala Guide",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
        isOnline: true,
        lat: 10.0889,
        lng: 77.0595
      });

      const seedTrips = [
        {
          trip: {
            name: "Munnar Tea Gardens",
            destination: "Munnar, Kerala",
            image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=800&h=600&fit=crop",
            startDate: new Date("2024-08-10"),
            endDate: new Date("2024-08-15"),
            budgetTotal: 15000,
            status: "planned",
            isHidden: true,
          },
          places: [
            {
              name: "Eravikulam National Park",
              lat: 10.2000,
              lng: 77.0833,
              image: "https://images.unsplash.com/photo-1626014303757-636611633391?w=400&h=300&fit=crop",
              order: 0,
              type: "nature",
              description: "Home of the Nilgiri Tahr"
            }
          ]
        },
        {
          trip: {
            name: "Vagamon Meadows",
            destination: "Vagamon, Kerala",
            image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=800&h=600&fit=crop",
            startDate: new Date("2024-09-05"),
            endDate: new Date("2024-09-08"),
            budgetTotal: 12000,
            status: "planned",
            isHidden: true,
          },
          places: [
            {
              name: "Pine Forest",
              lat: 9.6891,
              lng: 76.9034,
              image: "https://images.unsplash.com/photo-1548625361-1250267d3372?w=400&h=300&fit=crop",
              order: 0,
              type: "nature",
              description: "Man-made pine forest"
            }
          ]
        },
        {
          trip: {
            name: "Ooty Queen of Hills",
            destination: "Ooty, Tamil Nadu",
            image: "https://images.unsplash.com/photo-1583067339460-e4b524785ca8?w=800&h=600&fit=crop",
            startDate: new Date("2024-10-12"),
            endDate: new Date("2024-10-16"),
            budgetTotal: 18000,
            status: "planned",
            isHidden: false,
          },
          places: [
            {
              name: "Ooty Botanical Garden",
              lat: 11.4173,
              lng: 76.7111,
              image: "https://images.unsplash.com/photo-1598502390636-6e119468923a?w=400&h=300&fit=crop",
              order: 0,
              type: "garden",
              description: "Historic botanical gardens"
            }
          ]
        },
        {
          trip: {
            name: "Alleppey Backwaters",
            destination: "Alleppey, Kerala",
            image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop",
            startDate: new Date("2024-11-20"),
            endDate: new Date("2024-11-23"),
            budgetTotal: 25000,
            status: "planned",
            isHidden: false,
          },
          places: []
        },
        {
          trip: {
            name: "Wayanad Wildlife Sanctuary",
            destination: "Wayanad, Kerala",
            image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
            startDate: new Date("2024-12-05"),
            endDate: new Date("2024-12-10"),
            budgetTotal: 20000,
            status: "planned",
            isHidden: false,
          },
          places: []
        },
        {
          trip: {
            name: "Capital Culture Tour",
            destination: "Thiruvananthapuram, Kerala",
            image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=800&h=600&fit=crop",
            startDate: new Date("2025-01-15"),
            endDate: new Date("2025-01-20"),
            budgetTotal: 30000,
            status: "planned",
            isHidden: false,
          },
          places: [
            {
              name: "Padmanabhaswamy Temple",
              lat: 8.4830,
              lng: 76.9435,
              image: "https://images.unsplash.com/photo-1626014303757-636611633391?w=400&h=300&fit=crop",
              order: 0,
              type: "culture",
              description: "Wealthiest temple in the world"
            }
          ]
        }
      ];

      await Promise.all(seedTrips.map(async (seed) => {
        const trip = await storage.createTrip(seed.trip as any);
        if (seed.places.length > 0) {
          await Promise.all(seed.places.map(place => 
            storage.createPlace({ ...place, tripId: trip.id as string })
          ));
        }
      }));

      log(`seeding complete in ${Date.now() - seedStart}ms.`);
    } else {
      log("seed data already exists.");
    }
  } catch (err) {
    console.error("ERROR: Seeding failed:", err);
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

  // Google Auth Routes
  app.get("/api/auth/google", (req, _res, next) => {
    console.log("Initiating Google Authentication...");
    next();
  }, passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    (req, res, next) => {
      console.log("Received Google Authentication callback...");
      passport.authenticate("google", (err: any, user: any, info: any) => {
        if (err) {
          console.error("Google Auth Error:", err);
          return res.status(500).json({ message: "Authentication failed", error: err.message });
        }
        if (!user) {
          console.warn("Google Auth failed: User not found", info);
          return res.redirect("/login");
        }
        req.logIn(user, (err) => {
          if (err) {
            console.error("Session login error:", err);
            return res.status(500).json({ message: "Login failed", error: err.message });
          }
          
          // Set session userId for consistency with existing auth
          (req.session as any).userId = user.id;
          console.log(`Successfully authenticated user: ${user.name} (${user.id})`);
          
          // Save session before redirecting to ensure it's persisted
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.status(500).json({ message: "Session save failed" });
            }
            res.redirect("/dashboard");
          });
        });
      })(req, res, next);
    }
  );

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

  app.get("/api/seed", async (req, res) => {
    // Clear existing data if requested
    if (req.query.clear === "true") {
      await User.deleteMany({ username: { $ne: "admin" } });
      await Trip.deleteMany({});
      await Place.deleteMany({});
      await Member.deleteMany({});
      await Expense.deleteMany({});
      console.log("Database cleared for fresh seeding");
    }
    // Create Munnar Trip
    const munnar = await storage.createTrip({
      name: "Munnar Tea Gardens",
      destination: "Munnar, Kerala",
      image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=800&h=600&fit=crop",
      startDate: new Date("2024-08-10"),
      endDate: new Date("2024-08-15"),
      budgetTotal: 15000,
      status: "planned",
      isHidden: true,
    });

    await storage.createPlace({
      tripId: munnar.id as string,
      name: "Eravikulam National Park",
      lat: 10.2000,
      lng: 77.0833,
      image: "https://images.unsplash.com/photo-1626014303757-636611633391?w=400&h=300&fit=crop",
      order: 0,
      type: "nature",
      description: "Home of the Nilgiri Tahr"
    });

    // Vagamon Trip
    const vagamon = await storage.createTrip({
      name: "Vagamon Meadows",
      destination: "Vagamon, Kerala",
      image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=800&h=600&fit=crop",
      startDate: new Date("2024-09-05"),
      endDate: new Date("2024-09-08"),
      budgetTotal: 12000,
      status: "planned",
      isHidden: true,
    });

    await storage.createPlace({
      tripId: vagamon.id as string,
      name: "Pine Forest",
      lat: 9.6891,
      lng: 76.9034,
      image: "https://images.unsplash.com/photo-1548625361-1250267d3372?w=400&h=300&fit=crop",
      order: 0,
      type: "nature",
      description: "Man-made pine forest"
    });

    // Ooty Trip
    const ooty = await storage.createTrip({
      name: "Ooty Queen of Hills",
      destination: "Ooty, Tamil Nadu",
      image: "https://images.unsplash.com/photo-1583067339460-e4b524785ca8?w=800&h=600&fit=crop",
      startDate: new Date("2024-10-12"),
      endDate: new Date("2024-10-16"),
      budgetTotal: 18000,
      status: "planned",
      isHidden: false,
    });

    await storage.createPlace({
      tripId: ooty.id as string,
      name: "Ooty Botanical Garden",
      lat: 11.4173,
      lng: 76.7111,
      image: "https://images.unsplash.com/photo-1598502390636-6e119468923a?w=400&h=300&fit=crop",
      order: 0,
      type: "garden",
      description: "Historic botanical gardens"
    });

    // Alleppey Trip
    await storage.createTrip({
      name: "Alleppey Backwaters",
      destination: "Alleppey, Kerala",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop",
      startDate: new Date("2024-11-20"),
      endDate: new Date("2024-11-23"),
      budgetTotal: 25000,
      status: "planned",
      isHidden: false,
    });

    // Wayanad Trip
    await storage.createTrip({
      name: "Wayanad Wildlife Sanctuary",
      destination: "Wayanad, Kerala",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
      startDate: new Date("2024-12-05"),
      endDate: new Date("2024-12-10"),
      budgetTotal: 20000,
      status: "planned",
      isHidden: false,
    });

    res.json({ message: "Database seeded with Kerala tourist data!" });
  });

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

  app.put(api.trips.update.path, requireAuth, async (req, res) => {
    const id = String(req.params.id);
    const input = api.trips.update.input.parse(req.body);
    try {
      const trip = await storage.updateTrip(id, input);
      res.json(trip);
    } catch (err) {
      res.status(404).json({ message: "Trip not found" });
    }
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
