import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { v2 as cloudinary } from "cloudinary";

const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

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
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Check file type
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return new NextResponse(
        "Unsupported image format. Please upload PNG, JPEG, GIF, or WebP images only.",
        { status: 415 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
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

    return NextResponse.json({
      url: (result as any).secure_url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new NextResponse("Error uploading file", { status: 500 });
  }
}
