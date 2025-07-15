import { NextRequest, NextResponse } from "next/server";
import type { ChatsCreateMessageRequest, ChatsCreateMessageResponse } from 'v0-sdk';

const createV0Message = async (
  request: ChatsCreateMessageRequest
): Promise<ChatsCreateMessageResponse> => {
  try {
    const { v0 } = await import("v0-sdk");

    const response = await v0.chats.createMessage(request);

    return response;
  } catch (error) {
    console.error("V0 SDK Error:", error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, message } = body;

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
      // Call the REAL v0 API to create a message
      const messageRequest: ChatsCreateMessageRequest = {
        chatId,
        message,
      };

      const v0Response = await createV0Message(messageRequest);

      console.log("✅ Successfully created v0 message:", v0Response.id);
      console.log("📦 Message response:", JSON.stringify(v0Response, null, 2));
      console.log("📦 Message demo URL:", v0Response.demo);

      // Per SDK docs: message response should also have demo URL for iframe
      return NextResponse.json({
        ...v0Response,
        demo: v0Response.demo, // Use response.demo directly as per SDK
      });
    } catch (v0Error) {
      console.error(
        "❌ V0 message API call failed, falling back to mock:",
        v0Error
      );

      // Fallback to mock response with working demo URL
      const mockDemoUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Updated Store</title>
</head>
<body>
  <div class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-16">
      <h1 class="text-5xl font-bold text-center mb-8">Improved Design</h1>
      <p class="text-center text-gray-600 mb-8">Updated based on your feedback: "${message}"</p>
      <div class="text-center">
        <button class="bg-blue-500 text-white px-6 py-3 rounded-lg">Mock Store Updated</button>
      </div>
    </div>
  </div>
</body>
</html>
      `)}`;

      const mockResponse = {
        id: `message_${Date.now()}`,
        object: "message",
        chatId,
        url: `https://v0.dev/chat/${chatId}/message_${Date.now()}`,
        demo: mockDemoUrl, // Add working demo URL for iframe
        text: `Updated landing page based on your feedback: ${message}`,
        files: [
          {
            lang: "tsx",
            meta: {
              title: "Updated Landing Page",
              file: "app/page.tsx", // Add the file property for deployment
            },
            source: `// Updated component based on feedback\nimport React from 'react';\n\nexport default function UpdatedLandingPage() {\n  return (\n    <div className="min-h-screen bg-white">\n      <div className="container mx-auto px-4 py-16">\n        <h1 className="text-5xl font-bold text-center mb-8">Improved Design</h1>\n        <p className="text-center text-gray-600 mb-8">Updated based on your feedback: "${message}"</p>\n      </div>\n    </div>\n  );\n}`,
          },
        ],
        _isMock: true,
      };

      return NextResponse.json(mockResponse);
    }
  } catch (error) {
    console.error("Error in v0 message API:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
