import {
  User as UserType, InsertUser, Trip as TripType, InsertTrip,
  Place as PlaceType, InsertPlace, Expense as ExpenseType, InsertExpense,
  Member as MemberType, InsertMember
} from "@shared/schema";
import { User, Trip, Place, Expense, Member } from "./db";
import mongoose from "mongoose";

export interface IStorage {
  // Users
  getUser(id: string): Promise<UserType | undefined>;
  getUserByUsername(username: string): Promise<UserType | undefined>;
  getUserByGoogleId(googleId: string): Promise<UserType | undefined>;
  createUser(user: InsertUser): Promise<UserType>;

  // Trips
  getTrips(): Promise<TripType[]>;
  getTrip(id: string): Promise<TripType | undefined>;
  createTrip(trip: InsertTrip): Promise<TripType>;
  updateTrip(id: string, trip: Partial<InsertTrip>): Promise<TripType>;

  // Places
  getPlaces(tripId: string): Promise<PlaceType[]>;
  createPlace(place: InsertPlace): Promise<PlaceType>;
  reorderPlaces(placeIds: string[]): Promise<PlaceType[]>;

  // Expenses
  getExpenses(tripId: string): Promise<ExpenseType[]>;
  createExpense(expense: InsertExpense): Promise<ExpenseType>;

  // Members
  getMembers(tripId: string): Promise<(MemberType & { user: UserType })[]>;
}

export class DatabaseStorage implements IStorage {
  private toUser(doc: any): UserType {
    const obj = doc.toObject();
    return { ...obj, id: obj._id.toString() };
  }

  private toTrip(doc: any): TripType {
    const obj = doc.toObject();
    return { ...obj, id: obj._id.toString() };
  }

  private toPlace(doc: any): PlaceType {
    const obj = doc.toObject();
    return { ...obj, id: obj._id.toString(), tripId: obj.tripId.toString() };
  }

  private toExpense(doc: any): ExpenseType {
    const obj = doc.toObject();
    return { ...obj, id: obj._id.toString(), tripId: obj.tripId.toString(), userId: obj.userId.toString() };
  }

  private toMember(doc: any): MemberType {
    const obj = doc.toObject();
    return { ...obj, id: obj._id.toString(), tripId: obj.tripId.toString(), userId: obj.userId.toString() };
  }

  async getUser(id: string): Promise<UserType | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
      const user = await User.findById(id);
      return user ? this.toUser(user) : undefined;
    } catch (error) {
      console.error(`[Storage] getUser(${id}) failed:`, error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? this.toUser(user) : undefined;
    } catch (error) {
      console.error(`[Storage] getUserByUsername(${username}) failed:`, error);
      throw error;
    }
  }

  async getUserByGoogleId(googleId: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ googleId });
      return user ? this.toUser(user) : undefined;
    } catch (error) {
      console.error(`[Storage] getUserByGoogleId(${googleId}) failed:`, error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<UserType> {
    try {
      const newUser = new User(user);
      await newUser.save();
      return this.toUser(newUser);
    } catch (error) {
      console.error("[Storage] createUser failed:", error);
      throw error;
    }
  }

  async getTrips(): Promise<TripType[]> {
    try {
      const trips = await Trip.find().sort({ startDate: -1 });
      return trips.map(t => this.toTrip(t));
    } catch (error) {
      console.error("[Storage] getTrips failed:", error);
      throw error;
    }
  }

  async getTrip(id: string): Promise<TripType | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
      const trip = await Trip.findById(id);
      return trip ? this.toTrip(trip) : undefined;
    } catch (error) {
      console.error(`[Storage] getTrip(${id}) failed:`, error);
      throw error;
    }
  }

  async createTrip(trip: InsertTrip): Promise<TripType> {
    try {
      const newTrip = new Trip(trip);
      await newTrip.save();
      return this.toTrip(newTrip);
    } catch (error) {
      console.error("[Storage] createTrip failed:", error);
      throw error;
    }
  }

  async updateTrip(id: string, updates: Partial<InsertTrip>): Promise<TripType> {
    try {
      const updatedTrip = await Trip.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedTrip) throw new Error("Trip not found");
      return this.toTrip(updatedTrip);
    } catch (error) {
      console.error(`[Storage] updateTrip(${id}) failed:`, error);
      throw error;
    }
  }

  async getPlaces(tripId: string): Promise<PlaceType[]> {
    try {
      const places = await Place.find({ tripId }).sort({ order: 1 });
      return places.map(p => this.toPlace(p));
    } catch (error) {
      console.error(`[Storage] getPlaces(${tripId}) failed:`, error);
      throw error;
    }
  }

  async createPlace(place: InsertPlace): Promise<PlaceType> {
    try {
      const newPlace = new Place(place);
      await newPlace.save();
      return this.toPlace(newPlace);
    } catch (error) {
      console.error("[Storage] createPlace failed:", error);
      throw error;
    }
  }

  async reorderPlaces(placeIds: string[]): Promise<PlaceType[]> {
    try {
      const updates = placeIds.map((id, index) => 
        Place.findByIdAndUpdate(id, { order: index }, { new: true })
      );
      const results = await Promise.all(updates);
      return results.filter(r => r !== null).map(r => this.toPlace(r));
    } catch (error) {
      console.error("[Storage] reorderPlaces failed:", error);
      throw error;
    }
  }

  async getExpenses(tripId: string): Promise<ExpenseType[]> {
    try {
      const expenses = await Expense.find({ tripId }).sort({ date: -1 });
      return expenses.map(e => this.toExpense(e));
    } catch (error) {
      console.error(`[Storage] getExpenses(${tripId}) failed:`, error);
      throw error;
    }
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseType> {
    try {
      const newExpense = new Expense(expense);
      await newExpense.save();
      return this.toExpense(newExpense);
    } catch (error) {
      console.error("[Storage] createExpense failed:", error);
      throw error;
    }
  }

  async getMembers(tripId: string): Promise<(MemberType & { user: UserType })[]> {
    try {
      const members = await Member.find({ tripId }).populate('userId');
      return members.map(m => {
        const member = this.toMember(m);
        return {
          ...member,
          user: this.toUser(m.userId)
        };
      });
    } catch (error) {
      console.error(`[Storage] getMembers(${tripId}) failed:`, error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
