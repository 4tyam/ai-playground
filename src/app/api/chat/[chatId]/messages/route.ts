import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "../../../../../../db";
import { messages, users } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) => {
  const session = await auth();
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { chatId } = await params;
    
    const chatMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        role: messages.role,
        sentAt: messages.sentAt,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.sentAt);

    return NextResponse.json({
        chatMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}; 