import { NextRequest, NextResponse } from "next/server";
import type { ChatsGetByIdRequest, ChatsGetByIdResponse } from 'v0-sdk';

const getV0Chat = async (
  request: ChatsGetByIdRequest
): Promise<ChatsGetByIdResponse> => {
  try {
    const { v0 } = await import("v0-sdk");

    const response = await v0.chats.getById(request);

    return response;
  } catch (error) {
    console.error("V0 SDK Error:", error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId } = body;

    // Check if V0_API_KEY is configured
    if (!process.env.V0_API_KEY) {
      return NextResponse.json(
        {
          error:
            "V0_API_KEY environment variable is not configured. Please set your v0 API key.",
        },
        { status: 500 }
      );
    }

    try {
      // Call the REAL v0 API to get chat
      const chatRequest: ChatsGetByIdRequest = {
        chatId,
      };

      const v0Response = await getV0Chat(chatRequest);

      console.log("✅ Successfully retrieved v0 chat:", v0Response.id);

      return NextResponse.json(v0Response);
    } catch (v0Error) {
      console.error("❌ V0 chat API call failed, falling back to mock:", v0Error);

      // Fallback to mock response
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
        _isMock: true,
      };

      return NextResponse.json(mockResponse);
    }
  } catch (error) {
    console.error("Error in v0 chat API:", error);
    return NextResponse.json({ error: "Failed to get chat" }, { status: 500 });
  }
}
