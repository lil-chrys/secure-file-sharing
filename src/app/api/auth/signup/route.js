import bcrypt from "bcryptjs";
import { connectToDB } from "@/app/lib/db";
import User from "@/app/models/User";
export async function POST(req) {
  try {
    console.log(process.env.MONGODB_URI,"Mongo uri")
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password || password.length < 6) {
      return Response.json({ message: "Invalid input" }, { status: 400 });
    }

    await connectToDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return Response.json({ message: "User created", user: { id: newUser._id, email } }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
