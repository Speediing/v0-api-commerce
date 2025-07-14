import { ComponentData } from "@/components/Builder";

// Business data interface for landing page generation
interface BusinessData {
  businessName: string;
  industry: string;
  targetAudience: string;
  mainGoal: string;
  keyBenefits: string[];
  callToAction: string;
  contactInfo: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
  tone: string;
}

interface GeneratedLandingPage {
  id: string;
  generatedAt: string;
  businessData: BusinessData;
  v0ChatId?: string;
  v0Url?: string;
  demo?: string; // Added for iframe URL
  content: string; // Changed from html to content
  _isMock?: boolean; // Added for mock indicator
}

interface V0File {
  lang: string;
  source: string;
}

interface V0MessageResponse {
  id: string;
  text: string;
  files?: V0File[];
  url?: string;
  demo?: string;
}

interface V0ApiData {
  message?: string;
  chatId?: string;
  modelConfiguration?: {
    modelId: string;
    imageGenerations: boolean;
    thinking: boolean;
  };
  chatPrivacy?: string;
}

// Helper function to call v0 API via server-side endpoint
async function callV0API(endpoint: string, data: V0ApiData) {
  const response = await fetch(`/api/v0/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`V0 API Error: ${error}`);
  }

  return response.json();
}

export async function generateComponentWithV0(
  prompt: string
): Promise<ComponentData> {
  try {
    // Create a new chat with the component prompt
    const chatResponse = await callV0API("chats", {
      message: prompt,
      modelConfiguration: {
        modelId: "v0-1.5-lg",
        imageGenerations: false,
        thinking: false,
      },
    });

    // Extract the generated component information
    const generatedComponent: ComponentData = {
      id: `v0-${chatResponse.id}`,
      type: "v0-generated",
      name: "V0 Generated Component",
      props: {
        prompt,
        generatedAt: new Date().toISOString(),
        v0ChatId: chatResponse.id,
        v0Url: chatResponse.url,
      },
      generatedCode: chatResponse.text || "",
      v0ChatId: chatResponse.id,
    };

    return generatedComponent;
  } catch (error) {
    console.error("Error generating component with V0:", error);
    throw new Error(
      `Failed to generate component: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function generateLandingPageWithV0(
  businessData: BusinessData
): Promise<GeneratedLandingPage> {
  try {
    // Create a comprehensive prompt for the landing page
    const prompt = `Create a professional, modern landing page for email marketing campaigns. Here are the details:

**Business:** ${businessData.businessName}
**Industry:** ${businessData.industry}
**Target Audience:** ${businessData.targetAudience}
**Main Goal:** ${businessData.mainGoal}
**Key Benefits:** 
${businessData.keyBenefits.map((benefit) => `- ${benefit}`).join("\n")}
**Call to Action:** ${businessData.callToAction}
**Brand Colors:** Primary: ${businessData.brandColors.primary}, Secondary: ${
      businessData.brandColors.secondary
    }
**Tone:** ${businessData.tone}
${
  businessData.contactInfo
    ? `**Contact Info:** ${businessData.contactInfo}`
    : ""
}

Please create a complete landing page with:
1. Hero section with business name, compelling headline, and key benefits
2. Professional styling using the brand colors provided
3. Clear call-to-action buttons
4. Responsive design that works on mobile and desktop
5. Modern, clean design optimized for email marketing conversions
6. Include any contact information provided

Make it visually appealing and conversion-focused for ${businessData.tone.toLowerCase()} tone.`;

    // Call our API endpoint which handles the v0 integration
    const response = await callV0API("chats", {
      message: prompt,
      modelConfiguration: {
        modelId: "v0-1.5-lg",
        imageGenerations: true,
        thinking: false,
      },
      chatPrivacy: "private",
    });

    // Extract the generated content
    const generatedPage: GeneratedLandingPage = {
      id: `v0-landing-${response.id}`,
      generatedAt: new Date().toISOString(),
      businessData,
      v0ChatId: response.id,
      v0Url: response.url,
      demo: response.demo, // The iframe URL for preview
      content: response.text || "", // The generated React component code
    };

    return generatedPage;
  } catch (error) {
    console.error("Error generating landing page with V0:", error);
    throw new Error(
      `Failed to generate landing page: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function regenerateLandingPage(
  chatId: string,
  feedback: string
): Promise<GeneratedLandingPage> {
  try {
    // Send a message to the existing chat with feedback
    const messageResponse: V0MessageResponse = await callV0API("message", {
      chatId,
      message: `Please refine the landing page based on this feedback: ${feedback}`,
    });

    // Get the updated chat data
    const chatResponse = await callV0API("chat", {
      chatId,
    });

    // Extract the updated content
    let htmlContent = "";

    if (messageResponse.files && messageResponse.files.length > 0) {
      const htmlFile = messageResponse.files.find(
        (file: V0File) =>
          file.lang === "tsx" || file.lang === "jsx" || file.lang === "html"
      );

      htmlContent = htmlFile?.source || messageResponse.text || "";
    } else {
      htmlContent = messageResponse.text || "";
    }

    return {
      id: `v0-landing-${chatId}-updated`,
      generatedAt: new Date().toISOString(),
      businessData: {} as BusinessData, // Would need to be stored/retrieved
      v0ChatId: chatId,
      v0Url: chatResponse.url,
      content: htmlContent,
    };
  } catch (error) {
    console.error("Error regenerating landing page:", error);
    throw new Error(
      `Failed to regenerate landing page: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
