import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection (Atlas or local).
 *
 * The connection is lazy: the app works without MONGODB_URI defined and only
 * fails if some code actually touches the database. Copy `.env.example` to
 * `.env.local` and set the URI when you want to connect for real.
 *
 * In development the client is cached on `globalThis` to survive Next's
 * hot reload without opening a new connection on every refresh.
 */

const DB_NAME = process.env.MONGODB_DB ?? "dagacorazon";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and configure it.",
    );
  }
  return new MongoClient(uri).connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    globalThis._mongoClientPromise ??= createClient();
    return globalThis._mongoClientPromise;
  }
  return createClient();
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

/** Collection names — single source of truth. */
export const collections = {
  users: "users",
  adversaries: "adversaries",
  colossi: "colossi",
  environments: "environments",
  equipment: "equipment",
  canvases: "canvases",
  sessions: "sessions",
} as const;
