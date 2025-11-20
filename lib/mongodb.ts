import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = 'evoting-osis'

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

interface MongoCache {
  conn: { client: MongoClient; db: Db } | null
  promise: Promise<{ client: MongoClient; db: Db }> | null
}

declare global {
  var mongo: MongoCache | undefined
}

let cached: MongoCache = global.mongo || { conn: null, promise: null }

if (!global.mongo) {
  global.mongo = cached
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      }
    })
  }
  
  cached.conn = await cached.promise
  return cached.conn
}
