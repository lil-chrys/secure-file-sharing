import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = crypto.randomBytes(32).toString("hex"); // Ensure a valid 32-byte key
const ivLength = 16; // IV must be 16 bytes

export const encryptFile = (buffer) => {
  const iv = crypto.randomBytes(ivLength);
  const key = Buffer.from(secretKey, "hex");

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    salt: secretKey, // Save the key with the file for decryption
  };
};

export const decryptFile = (encryptedData, iv, salt) => {
  const key = Buffer.from(salt, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));

  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
};
