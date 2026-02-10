import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be set in environment variables");
}

console.log("Connecting to MongoDB...");
mongoose.connect(MONGODB_URI)
  .then(() => console.log("SUCCESS: Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("CRITICAL: MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

mongoose.connection.on('error', err => {
  console.error("RUNTIME: MongoDB error:", err);
});

mongoose.connection.on('disconnected', () => {
  console.warn("WARNING: MongoDB disconnected");
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  email: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  avatar: String,
  isOnline: { type: Boolean, default: false },
  lat: Number,
  lng: Number,
});

const tripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  image: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  budgetTotal: { type: Number, default: 0 },
  budgetSpent: { type: Number, default: 0 },
  status: { type: String, enum: ["planned", "active", "completed"], default: "planned" },
  memberCount: { type: Number, default: 1 },
  isHidden: { type: Boolean, default: false },
});

const placeSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  image: String,
  order: { type: Number, required: true },
  description: String,
  eta: String,
  type: { type: String, default: "attraction" },
});

const expenseSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String,
  date: { type: Date, default: Date.now },
});

const memberSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  contribution: { type: Number, default: 0 },
});

export const User = mongoose.model("User", userSchema);
export const Trip = mongoose.model("Trip", tripSchema);
export const Place = mongoose.model("Place", placeSchema);
export const Expense = mongoose.model("Expense", expenseSchema);
export const Member = mongoose.model("Member", memberSchema);

export const db = mongoose.connection;
