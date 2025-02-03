import { connectToDatabase } from '../lib/mongodb';

export const createUser = async (userData) => {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  
  const result = await collection.insertOne(userData);
  
  return {
    ...userData,
    _id: result.insertedId.toString() 
  };
};


export const findUserByEmail = async (email) => {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  
  const user = await collection.findOne({ email });
  return user;
};
