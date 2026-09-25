import { MongoClient } from "mongodb";

// Cached on globalThis so hot reloads (dev) and warm serverless invocations reuse one connection.
const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");

  const cached = globalForMongo._mongoClientPromise;
  if (cached) return cached;

  const created = new MongoClient(uri).connect();
  globalForMongo._mongoClientPromise = created;
  return created;
}

export async function getDb() {
  const client = await getClient();
  return client.db("amxinz-landing");
}
