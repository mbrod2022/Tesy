import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: { topic: true },
  });
  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const mode = body.mode ?? "CHAT";
  const topicId: string | undefined = body.topicId ?? undefined;

  const conversation = await prisma.conversation.create({
    data: {
      title: body.title ?? "New conversation",
      mode,
      topicId,
    },
    include: { topic: true },
  });

  return NextResponse.json({ conversation });
}
