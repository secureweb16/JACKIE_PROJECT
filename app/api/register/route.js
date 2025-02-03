import bcrypt from 'bcryptjs'; 
import { createUser, findUserByEmail } from "../../models/User";

export async function POST(req) {
  const { email, password, username } = await req.json();
  console.log(req.body,"body")

  if (!email || !password || !username) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    // Check if the user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "User already registered" }),
        { status: 409 }
      );
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createUser({ email, password: hashedPassword, username });
    console.log(result, "result");

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: {
          email: result.email,
          username: result.username,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    return new Response(
      JSON.stringify({
        message: "Error creating user",
        error: error.message || "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
}
