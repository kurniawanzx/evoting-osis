import mongoose from 'mongoose';

function getMongoDBURI(): string {
  // For build time, return a dummy URI
  if (typeof window !== 'undefined') {
    return 'mongodb://localhost:27017/evoting-osis';
  }
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    // Return dummy URI for build, will fail at runtime if not set
    return 'mongodb://localhost:27017/evoting-osis';
  }
  
  return MONGODB_URI;
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Skip database connection during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return mongoose;
  }
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = getMongoDBURI();
    
    // Don't actually connect during build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      cached.promise = Promise.resolve(mongoose);
    } else {
      const opts = { bufferCommands: false };
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
