import { connectToDatabase } from "../lib/mongodb";
import { ObjectId } from "mongodb";

// Create a new file record in the MongoDB database
export const createFile = async (fileData) => {
  const db = await connectToDatabase();
  const collection = db.collection("files");

  // Insert the new file document
  const result = await collection.insertOne(fileData);

  // Return the inserted file details with the _id
  return {
    ...fileData,
    _id: result.insertedId.toString(),
  };
};

// Find files by userId
export const findFilesByUserId = async (userId) => {
  const db = await connectToDatabase();
  const collection = db.collection("files");

  try {
    // Query to find files by userId
    const files = await collection
      .find({ userId: new ObjectId(userId) })
      .toArray();
    return files;
  } catch (error) {
    console.error("Error finding files:", error);
    return [];
  }
};
