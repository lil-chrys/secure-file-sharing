"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "./components/button";
import Input from "./components/input";
import Slider from "./components/slider";
import { Upload } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/auth/signIn"); // Redirect to login if not authenticated
    }
  }, [session, status, router]);

  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    // ✅ Ensure user is authenticated
    if (!session) {
      router.push("/auth/signIn");
      return;
    }
  
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("expiry", expiry);
  
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  
    const data = await response.json();
    if (response.ok) {
      setDownloadLink(data.link);
    } else {
      console.error("Upload failed:", data.message);
    }
    
    setUploading(false);
  };
  
  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>; // Prevents UI flicker
  }

  if (!session) {
    return null; // Prevents rendering until redirected
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Secure File Upload</h2>
        <p>Welcome, {session.user.name}!</p>
        <Input type="file" onChange={handleFileChange} />
        <div className="mt-4">
          <p className="text-sm">Set Expiry Time: {expiry} minutes</p>
          <Slider min={1} max={60} value={[expiry]} onValueChange={(val) => setExpiry(val[0])} />
        </div>
        <Button className="w-full mt-4" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Uploading..." : <Upload className="mr-2" />}
          Upload & Get Link
        </Button>
        {downloadLink && (
          <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
            <p>File Uploaded! Shareable Link:</p>
            <a href={downloadLink} target="_blank" className="text-blue-600">
              {downloadLink}
            </a>
          </div>
        )}
      </div>

      <Link href="/auth/signUp">Sign Up</Link>
      <Link href="/auth/signIn">Sign In</Link>
    </div>
  );
}
