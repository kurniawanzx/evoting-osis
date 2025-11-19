import mongoose from 'mongoose';

function getMongoDBURI(): string {
  // Always return a valid URI for build time
  // This will fail at runtime if the real MONGODB_URI is not set
  return process.env.MONGODB_URI || 'mongodb://localhost:27017/evoting-osis-dummy';
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
  // For build time, don't actually connect
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = getMongoDBURI();
    const opts = {
      bufferCommands: false,
    };

    console.log('🔗 Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

export default connectDB;
