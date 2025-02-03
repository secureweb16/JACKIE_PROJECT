import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from "../../models/User";

const JWT_SECRET = "your_secret_key"; 

export async function POST(req) {
  const { email, password } = await req.json();

  // Check if any of the required fields are missing
  if (!email || !password) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    // Find the user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET,                              
      { expiresIn: '8h' }                    
    );

    return new Response(
      JSON.stringify({
        message: "Login successful",
        success:true,
        token, 
        user: {
          userId: user._id, 
          email: user.email,
          username: user.username,
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error logging in:", error);

    return new Response(
      JSON.stringify({
        message: "Error logging in",
        error: error.message || "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
}
