import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId } = body;

    // In a real implementation, this would use the MCP server to call:
    // await mcp.chats.getById({ chatId })

    const mockResponse = {
      id: chatId,
      object: "chat",
      url: `https://v0.dev/chat/${chatId}`,
      shareable: true,
      privacy: "private",
      title: "Generated Landing Page",
      favorite: false,
      authorId: "user_123",
      messages: [
        {
          id: `message_${Date.now()}`,
          object: "message",
          content: "Landing page generated successfully",
          createdAt: new Date().toISOString(),
          type: "message",
        },
      ],
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Error in v0 chat API:", error);
    return NextResponse.json({ error: "Failed to get chat" }, { status: 500 });
  }
}
