/// <reference path="../types/global.d.ts" />
import mongoose from "mongoose";


const mongoUri = process.env.MONGODB_URI!;
console.log(mongoUri);
console.log(global.mongoose)
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { connection: null, promise: null };
}

export const connectToMongoDb = async () => {
  if (cached.connection) {
    return cached.connection;
  }
  if (!cached.promise) {
    const option = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(mongoUri , option)
      .then((mongoose) => mongoose.connection);
  }
  try {
    cached.connection = await cached.promise;
    console.log("MongoDB connected");
  } catch (error) {
    cached.promise = null;
    console.error("Error connecting to MongoDB:", error);
  }
  return cached.connection;
};
