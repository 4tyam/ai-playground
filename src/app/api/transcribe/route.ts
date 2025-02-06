import { NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import os from "os";
import { db } from "../../../../db";
import { users } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/auth";

const client = new OpenAI();

const TRANSCRIPTION_COST_PER_SECOND = 0.0001166667;

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get user's current usage and limits
  const userInfo = await db
    .select({
      usageAmount: users.usageAmount,
      maxAmount: users.maxAmount
    })
    .from(users)
    .where(eq(users.id, session.user.id as string))
    .limit(1);

  if (!userInfo.length) {
    return new NextResponse("User not found", { status: 404 });
  }

  const { usageAmount } = userInfo[0];


  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      throw new Error("No audio file provided");
    }

    // Create a temporary file path
    const tmpFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
    
    // Convert the audio file to a buffer and write to temp file
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tmpFilePath, buffer);

    // Create a read stream from the temp file
    const fileStream = createReadStream(tmpFilePath);

    const transcription = await client.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    const cost = Number(transcription.duration * TRANSCRIPTION_COST_PER_SECOND).toFixed(20);

    await db.transaction(async (tx) => {
      // Update user's total usage
      await tx
        .update(users)
        .set({ 
          usageAmount: (Number(usageAmount) + Number(cost)).toFixed(20)
        })
        .where(eq(users.id, session?.user?.id as string));
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
} 