import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient("mongodb://localhost:27017");
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient("mongodb://localhost:27017");
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  try {
    const clientConnection = await clientPromise;
    const db = clientConnection.db('yourDatabase'); 
    
    console.log('MongoDB connected');

    const collections = await db.collections();
    console.log('Collections:', collections);

    return db; 
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to the database');
  }
}
