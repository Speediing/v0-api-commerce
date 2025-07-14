import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId } = body;

    // In a real implementation, this would use the MCP server to call:
    // await mcp.chats.findIframe({ chatId })

    const mockResponse = {
      demo: `https://v0.dev/r/demo_${chatId}_${Date.now()}`,
      iframe: `<iframe src="https://v0.dev/r/demo_${chatId}_${Date.now()}" width="100%" height="600px" frameborder="0"></iframe>`,
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Error in v0 iframe API:", error);
    return NextResponse.json(
      { error: "Failed to get iframe" },
      { status: 500 }
    );
  }
}
