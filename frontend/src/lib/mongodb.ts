import mongoose from "mongoose"

interface MongooseConnection {
  conn: null | { connection: mongoose.Connection }
  promise: Promise<{ connection: mongoose.Connection }> | null
}

// Use module augmentation to declare the global variable
declare global {
  var mongooseConnection: MongooseConnection | undefined
}

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env")
}

// Initialize the cached connection if it doesn't exist
if (!global.mongooseConnection) {
  global.mongooseConnection = { conn: null, promise: null }
}

const cached = global.mongooseConnection

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => ({ connection: mongoose.connection }))
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

