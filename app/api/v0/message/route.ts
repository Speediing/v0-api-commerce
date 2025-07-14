import { NextRequest, NextResponse } from "next/server";

interface V0MessageFile {
  lang: string;
  meta: {
    title: string;
  };
  source: string;
}

interface V0MessageResponse {
  id: string;
  object: string;
  chatId: string;
  url: string;
  text: string;
  files?: V0MessageFile[];
  demo?: string;
}

const createV0Message = async (
  chatId: string,
  message: string
): Promise<V0MessageResponse> => {
  try {
    const { v0 } = await import("v0-sdk");

    const response = await v0.chats.createMessage({
      chatId,
      message,
    });

    return response as V0MessageResponse;
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
      const v0Response = await createV0Message(chatId, message);

      console.log("✅ Successfully created v0 message:", v0Response.id);

      // The response should include the updated demo URL
      const iframeUrl = v0Response.demo || "";

      return NextResponse.json({
        ...v0Response,
        demo: iframeUrl,
      });
    } catch (v0Error) {
      console.error(
        "❌ V0 message API call failed, falling back to mock:",
        v0Error
      );

      // Fallback to mock response
      const mockResponse = {
        id: `message_${Date.now()}`,
        object: "message",
        chatId,
        url: `https://v0.dev/chat/${chatId}/message_${Date.now()}`,
        text: `Updated landing page based on your feedback: ${message}`,
        files: [
          {
            lang: "tsx",
            meta: {
              title: "Updated Landing Page",
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
