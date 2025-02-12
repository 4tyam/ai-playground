import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { v2 as cloudinary } from "cloudinary";

const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

const MAX_FILES = 4;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return new NextResponse("No files provided", { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return new NextResponse(`Maximum ${MAX_FILES} files allowed`, {
        status: 400,
      });
    }

    // Validate all files before uploading
    for (const file of files) {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        return new NextResponse(
          "Unsupported image format. Please upload PNG, JPEG, GIF, or WebP images only.",
          { status: 415 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return new NextResponse(
          "File size too large. Maximum size is 4MB per file.",
          { status: 413 }
        );
      }
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64File = `data:${file.type};base64,${buffer.toString(
        "base64"
      )}`;

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          base64File,
          {
            folder: "ai-chat",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      urls: (results as { secure_url: string }[]).map(
        (result) => result.secure_url
      ),
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return new NextResponse("Error uploading files", { status: 500 });
  }
}
