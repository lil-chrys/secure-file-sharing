import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  originalFilename: { type: String, required: true }, // Store original filename
  mimeType: { type: String, required: true }, // Store MIME type
  encryptedFile: { type: String, required: true }, // Store encrypted file data
  expiryTime: { type: Date, required: true },
  downloadLink: { type: String, required: true, unique: true },
  salt: { type: String, required: true },
  iv: { type: String, required: true },
});

export default mongoose.models.File || mongoose.model("File", FileSchema);
