import { NextRequest, NextResponse } from "next/server";

// Import the real v0 SDK
// Note: You'll need to set V0_API_KEY environment variable
const createV0Chat = async (
  message: string,
  modelConfiguration: Record<string, unknown>,
  chatPrivacy:
    | "private"
    | "public"
    | "team-edit"
    | "team"
    | "unlisted" = "private"
) => {
  try {
    // This requires V0_API_KEY to be set in environment variables
    const { v0 } = await import("v0-sdk");

    const response = await v0.chats.create({
      message,
      modelConfiguration: modelConfiguration || {
        modelId: "v0-1.5-lg",
        imageGenerations: true,
        thinking: false,
      },
      chatPrivacy,
    });

    return response;
  } catch (error) {
    console.error("V0 SDK Error:", error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, modelConfiguration, chatPrivacy = "private" } = body;

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
      // Call the REAL v0 API
      const v0Response = await createV0Chat(
        message,
        modelConfiguration,
        chatPrivacy
      );

      console.log("✅ Successfully called real v0 API:", v0Response.id);
      console.log("Chat response:", JSON.stringify(v0Response, null, 2));

      // The v0 response should already include the demo URL for iframe preview
      // No need for separate iframe call - chat.demo is already available
      const iframeUrl = (v0Response as any).demo || "";

      console.log("📦 Demo URL from chat response:", iframeUrl);

      // Return the response with the iframe URL
      return NextResponse.json({
        ...v0Response,
        v0Url: v0Response.url,
        demo: iframeUrl || v0Response.url, // Use demo URL for preview, fallback to chat URL
      });
    } catch (v0Error) {
      console.error("❌ V0 API call failed, falling back to mock:", v0Error);

      // Fallback to mock if real API fails
      const mockHtmlContent = generateMockLandingPageCode(message);
      const mockDataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>${extractBusinessName(message) || "Generated Landing Page"}</title>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    const businessName = "${extractBusinessName(message) || "Your Business"}";
    const callToAction = "${
      extractCallToAction(message) || "Get Started Today"
    }";
    
    function GeneratedLandingPage() {
      return React.createElement('div', {
        className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'
      },
        React.createElement('div', {
          className: 'container mx-auto px-4 py-16'
        },
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('h1', {
              className: 'text-4xl md:text-6xl font-bold text-gray-900 mb-6'
            }, businessName),
            React.createElement('p', {
              className: 'text-xl text-gray-600 mb-8 max-w-2xl mx-auto'
            }, 'Transform your business with our innovative solutions designed for modern entrepreneurs.'),
            React.createElement('button', {
              className: 'bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors'
            }, callToAction)
          ),
          React.createElement('div', {
            className: 'grid md:grid-cols-3 gap-8 mt-16'
          },
            React.createElement('div', {
              className: 'bg-white p-6 rounded-lg shadow-md'
            },
              React.createElement('h3', {
                className: 'text-xl font-semibold mb-4'
              }, 'Innovation'),
              React.createElement('p', {
                className: 'text-gray-600'
              }, 'Cutting-edge solutions for your business needs.')
            ),
            React.createElement('div', {
              className: 'bg-white p-6 rounded-lg shadow-md'
            },
              React.createElement('h3', {
                className: 'text-xl font-semibold mb-4'
              }, 'Quality'),
              React.createElement('p', {
                className: 'text-gray-600'
              }, 'Premium services you can trust and rely on.')
            ),
            React.createElement('div', {
              className: 'bg-white p-6 rounded-lg shadow-md'
            },
              React.createElement('h3', {
                className: 'text-xl font-semibold mb-4'
              }, 'Support'),
              React.createElement('p', {
                className: 'text-gray-600'
              }, '24/7 customer support when you need it most.')
            )
          )
        )
      );
    }
    
    ReactDOM.render(React.createElement(GeneratedLandingPage), document.getElementById('root'));
  </script>
</body>
</html>
      `)}`;

      const mockResponse = {
        id: `chat_${Date.now()}`,
        object: "chat",
        url: `https://v0.dev/chat/mock_${Date.now()}`,
        demo: mockDataUrl, // Use data URL for working iframe preview
        text: mockHtmlContent,
        files: [
          {
            lang: "tsx",
            meta: {
              title: "Landing Page (Mock)",
            },
            source: generateMockComponent(message),
          },
        ],
        modelConfiguration: modelConfiguration || {
          modelId: "v0-1.5-lg",
          imageGenerations: false,
          thinking: false,
        },
        _isMock: true,
      };

      return NextResponse.json(mockResponse);
    }
  } catch (error) {
    console.error("Error in v0 chats API:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}

// Helper functions to extract info from the prompt
function extractBusinessName(prompt: string): string {
  const match = prompt.match(/\*\*Business:\*\* (.+)/);
  return match ? match[1] : "";
}

function extractCallToAction(prompt: string): string {
  const match = prompt.match(/\*\*Call to Action:\*\* (.+)/);
  return match ? match[1] : "Get Started Today";
}

function generateMockLandingPageCode(prompt: string): string {
  const businessName = extractBusinessName(prompt) || "Your Business";

  return `
import React from 'react';

export default function GeneratedLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            ${businessName}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your business with our innovative solutions designed for modern entrepreneurs.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            ${extractCallToAction(prompt)}
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Innovation</h3>
            <p className="text-gray-600">Cutting-edge solutions for your business needs.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Quality</h3>
            <p className="text-gray-600">Premium services you can trust and rely on.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Support</h3>
            <p className="text-gray-600">24/7 customer support when you need it most.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

function generateMockComponent(prompt: string): string {
  const businessName = extractBusinessName(prompt) || "Your Business";
  const callToAction = extractCallToAction(prompt) || "Get Started Today";

  return `import React from 'react';

export default function GeneratedLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            ${businessName}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your business with our innovative solutions.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            ${callToAction}
          </button>
        </div>
      </div>
    </div>
  );
}`;
}
