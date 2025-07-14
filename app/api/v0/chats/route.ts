import { NextRequest, NextResponse } from "next/server";
import type { ChatsCreateRequest, ChatsCreateResponse, ChatsCreateMessageRequest } from 'v0-sdk';

const ECOMMERCE_TEMPLATE_CHAT_ID = "Dpf8aaD2Wfw";

// Try to fork from the ecommerce template chat
const forkV0Chat = async (
  fromChatId: string
): Promise<ChatsCreateResponse> => {
  try {
    const { v0 } = await import("v0-sdk");

    // Check if fork method exists
    if ('fork' in v0.chats && typeof v0.chats.fork === 'function') {
      console.log(`🔄 Attempting to fork from chat: ${fromChatId}`);
      
      // Try different parameter formats for the fork method
      let response;
      
      try {
        // Try format 1: { chatId: string }
        response = await (v0.chats as any).fork({ chatId: fromChatId });
      } catch (error1) {
        console.log(`❌ Fork attempt 1 failed:`, error1);
        
        try {
          // Try format 2: { id: string }
          response = await (v0.chats as any).fork({ id: fromChatId });
        } catch (error2) {
          console.log(`❌ Fork attempt 2 failed:`, error2);
          
          try {
            // Try format 3: direct string parameter
            response = await (v0.chats as any).fork(fromChatId);
          } catch (error3) {
            console.log(`❌ Fork attempt 3 failed:`, error3);
            throw new Error(`All fork attempts failed. Last error: ${error3}`);
          }
        }
      }
      
      console.log(`✅ Successfully forked chat: ${response.id}`);
      return response;
    } else {
      throw new Error("Fork method not available in SDK");
    }
  } catch (error) {
    console.error("V0 Fork Error:", error);
    throw error;
  }
};

// Create a new chat (fallback when fork is not available)
const createV0Chat = async (
  request: ChatsCreateRequest
): Promise<ChatsCreateResponse> => {
  try {
    const { v0 } = await import("v0-sdk");

    const response = await v0.chats.create(request);

    return response;
  } catch (error) {
    console.error("V0 SDK Error:", error);
    throw error;
  }
};

// Send a message to an existing chat
const sendV0Message = async (
  request: ChatsCreateMessageRequest
): Promise<any> => {
  try {
    const { v0 } = await import("v0-sdk");

    const response = await v0.chats.createMessage(request);

    return response;
  } catch (error) {
    console.error("V0 Message Error:", error);
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
      // STEP 1: Try to fork from the ecommerce template
      let v0Response: ChatsCreateResponse;
      
      try {
        console.log(`🔄 Attempting to fork from ecommerce template: ${ECOMMERCE_TEMPLATE_CHAT_ID}`);
        v0Response = await forkV0Chat(ECOMMERCE_TEMPLATE_CHAT_ID);
        
        // STEP 2: Send customization message to the forked chat
        console.log(`📝 Sending customization prompt to forked chat: ${v0Response.id}`);
        const messageRequest: ChatsCreateMessageRequest = {
          chatId: v0Response.id,
          message: message,
        };
        
        const messageResponse = await sendV0Message(messageRequest);
        console.log(`✅ Customization message sent successfully`);
        
        // Update the response with the latest content from the message
        console.log("📋 Message response:", JSON.stringify(messageResponse, null, 2));
        console.log("📋 Original chat demo:", v0Response.demo);
        console.log("📋 Message demo:", messageResponse.demo);
        console.log("📋 Message files:", messageResponse.files);
        
        // Use the message demo URL if available, otherwise keep original
        v0Response = {
          ...v0Response,
          text: messageResponse.text || v0Response.text,
          demo: messageResponse.demo || v0Response.demo,
          files: messageResponse.files || v0Response.files || [], // Get files from message response
        };
        
        console.log("📋 Final demo URL:", v0Response.demo);
        
      } catch (forkError) {
        console.log(`❌ Fork failed, trying template-inspired approach:`, forkError);
        
        // Fallback 1: Create new chat with template reference  
        const templateInspiredPrompt = `Using the ecommerce template structure from v0.dev/chat/${ECOMMERCE_TEMPLATE_CHAT_ID} as inspiration, please customize it with these details:

${message}

Focus on re-theming the existing ecommerce template structure rather than building from scratch:
- Keep the proven ecommerce layout and functionality
- Apply the specified brand colors and styling
- Update store name, content, and industry-specific details
- Maintain existing PayPal integration and shopping cart features
- Preserve responsive design and modern ecommerce patterns`;

        try {
          const chatRequest: ChatsCreateRequest = {
            message: templateInspiredPrompt,
            modelConfiguration: modelConfiguration || {
              modelId: "v0-1.5-lg",
              imageGenerations: true,
              thinking: false,
            },
            chatPrivacy: chatPrivacy as "private" | "public" | "team-edit" | "team" | "unlisted",
          };

          v0Response = await createV0Chat(chatRequest);
          console.log(`✅ Created template-inspired chat: ${v0Response.id}`);
        } catch (templateError) {
          console.log(`❌ Template-inspired approach failed, using original prompt:`, templateError);
          
          // Final fallback: Original approach
          const chatRequest: ChatsCreateRequest = {
            message,
            modelConfiguration: modelConfiguration || {
              modelId: "v0-1.5-lg",
              imageGenerations: true,
              thinking: false,
            },
            chatPrivacy: chatPrivacy as "private" | "public" | "team-edit" | "team" | "unlisted",
          };

          v0Response = await createV0Chat(chatRequest);
        }
      }

      console.log("✅ Successfully called real v0 API:", v0Response.id);
      console.log("📦 Full v0 response:", JSON.stringify(v0Response, null, 2));
      console.log("📦 Demo URL from SDK:", v0Response.demo);
      console.log("📦 Chat URL from SDK:", v0Response.url);

      // Per SDK docs: chat.demo should be ready for iframe embedding
      return NextResponse.json({
        ...v0Response,
        v0Url: v0Response.url,
        demo: v0Response.demo, // Use chat.demo directly as per SDK documentation
        files: v0Response.files || [], // Include files from v0 SDK response
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
