import { z } from "zod";

// === ZOD SCHEMAS ===

export const userSchema = z.object({
  id: z.string().optional(), // MongoDB uses string IDs
  username: z.string().min(1),
  password: z.string().optional(),
  email: z.string().email().optional(),
  googleId: z.string().optional(),
  name: z.string().min(1),
  avatar: z.string().optional(),
  isOnline: z.boolean().default(false),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const tripSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  destination: z.string().min(1),
  image: z.string().min(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budgetTotal: z.number().default(0),
  budgetSpent: z.number().default(0),
  status: z.enum(["planned", "active", "completed"]).default("planned"),
  memberCount: z.number().default(1),
});

export const placeSchema = z.object({
  id: z.string().optional(),
  tripId: z.string(),
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  image: z.string().optional(),
  order: z.number(),
  description: z.string().optional(),
  eta: z.string().optional(),
  type: z.string().default("attraction"),
});

export const expenseSchema = z.object({
  id: z.string().optional(),
  tripId: z.string(),
  userId: z.string(),
  category: z.string().min(1),
  amount: z.number(),
  description: z.string().optional(),
  date: z.date().default(() => new Date()),
});

export const memberSchema = z.object({
  id: z.string().optional(),
  tripId: z.string(),
  userId: z.string(),
  role: z.enum(["admin", "member"]).default("member"),
  contribution: z.number().default(0),
});

// === INSERT SCHEMAS ===

export const insertUserSchema = userSchema.omit({ id: true });
export const insertTripSchema = tripSchema.omit({ id: true, budgetSpent: true, memberCount: true });
export const insertPlaceSchema = placeSchema.omit({ id: true });
export const insertExpenseSchema = expenseSchema.omit({ id: true });
export const insertMemberSchema = memberSchema.omit({ id: true });

// === TYPES ===

export type User = z.infer<typeof userSchema>;
export type Trip = z.infer<typeof tripSchema>;
export type Place = z.infer<typeof placeSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Member = z.infer<typeof memberSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertPlace = z.infer<typeof insertPlaceSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;

// API Types
export type TripWithDetails = Trip & {
  places: Place[];
  members: (Member & { user: User })[];
};
