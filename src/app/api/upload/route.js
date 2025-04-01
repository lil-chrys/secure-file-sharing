import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ensure authOptions is correctly exported
import { encryptFile } from "@/app/lib/encrypt";
import File from "@/app/models/File";
import {connectToDB} from "@/app/lib/db";

export async function POST(req) {
  try {
    // Ensure the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file");
    const expiry = formData.get("expiry");
    console.log("formData: " + formData)

    if (!file || !expiry) {
      return NextResponse.json({ error: "File and expiry time are required" }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Encrypt the file
    const { encryptedData, iv, salt } = encryptFile(fileBuffer);

    // Generate a unique download link
    const downloadLink = `${process.env.NEXTAUTH_URL}/api/download/${crypto.randomUUID()}`;

    // Save to database
    await connectToDB();
    const newFile = new File({
      userId: session.user.id,
      email: session.user.email,
      encryptedFile: encryptedData,
      iv,
      salt,
      expiryTime: Date.now() + expiry * 60 * 1000, // Convert expiry to milliseconds
      downloadLink,
    });

    await newFile.save();

    return NextResponse.json({ link: downloadLink }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
