import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db";
import File from "@/app/models/File";
import { decryptFile } from "@/app/lib/encrypt";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Invalid download link" }, { status: 400 });
    }

    // Find the file by download ID
    const fileRecord = await File.findOne({ downloadLink: `${process.env.NEXTAUTH_URL}/api/download/${id}` });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found or expired" }, { status: 404 });
    }

    // Check if file has expired
    if (Date.now() > fileRecord.expiryTime) {
      await File.deleteOne({ _id: fileRecord._id }); // Remove expired file
      return NextResponse.json({ error: "Download link has expired" }, { status: 410 });
    }

    // Decrypt the file
    const decryptedBuffer = decryptFile(fileRecord.encryptedFile, fileRecord.iv, fileRecord.salt);

    // Return the decrypted file with the original filename and MIME type
    return new Response(decryptedBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileRecord.originalFilename}"`,
        "Content-Type": fileRecord.mimeType,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
