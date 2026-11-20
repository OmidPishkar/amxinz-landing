import { MongoClient } from "mongodb";

// Cache the connection promise across hot reloads and warm serverless invocations.
// Clear a rejected promise so transient DNS/network failures can recover on the next request.
const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");

  if (globalForMongo._mongoClientPromise) return globalForMongo._mongoClientPromise;

  const created = new MongoClient(uri).connect();
  globalForMongo._mongoClientPromise = created;
  created.catch(() => {
    if (globalForMongo._mongoClientPromise === created) {
      globalForMongo._mongoClientPromise = undefined;
    }
  });
  return created;
}

export async function getDb() {
  const client = await getClient();
  const dbName = process.env.MONGODB_DB?.trim() || "amxinz";
  return client.db(dbName);
}
