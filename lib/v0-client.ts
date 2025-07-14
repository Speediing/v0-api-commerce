import { ComponentData } from "@/components/Builder";

// Store data interface for ecommerce store generation
export interface StoreData {
  storeName: string;
  industry: string;
  productCategories: string[];
  targetAudience: string;
  storeDescription: string;
  paymentMethods: string[];
  shippingInfo: string;
  contactInfo: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
  storeStyle: string;
  featuredProducts?: string[];
  currency: string;
}

export interface GeneratedStore {
  id: string;
  generatedAt: string;
  storeData: StoreData;
  v0ChatId?: string;
  v0Url?: string;
  demo?: string; // Added for iframe URL
  content: string; // The generated store code
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
  chatPrivacy?: "private" | "public" | "team-edit" | "team" | "unlisted";
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

export async function generateStoreWithV0(
  storeData: StoreData
): Promise<GeneratedStore> {
  try {
    // Create a focused prompt for customizing the existing ecommerce template
    const prompt = `Please customize this ecommerce store template with the following brand details:

**Store Name:** ${storeData.storeName}
**Industry:** ${storeData.industry}
**Target Audience:** ${storeData.targetAudience}
**Store Description:** ${storeData.storeDescription}
**Brand Colors:** Primary: ${storeData.brandColors.primary}, Secondary: ${
      storeData.brandColors.secondary
    }
**Style:** ${storeData.storeStyle}
${
  storeData.shippingInfo
    ? `**Shipping Info:** ${storeData.shippingInfo}`
    : ""
}
${
  storeData.contactInfo
    ? `**Contact Info:** ${storeData.contactInfo}`
    : ""
}

Please update the existing template to:
- Replace placeholder store name with "${storeData.storeName}"
- Apply the brand colors (${storeData.brandColors.primary} primary, ${storeData.brandColors.secondary} secondary)
- Update content to match the ${storeData.industry} industry
- Adjust styling to be ${storeData.storeStyle.toLowerCase()}
- Update any placeholder text to reflect the target audience and store description
- Ensure PayPal remains the payment method
${storeData.shippingInfo ? `- Update shipping information to: ${storeData.shippingInfo}` : ""}

Keep all existing functionality and layout - just customize the branding, colors, and content.`;

    // Call our API endpoint which handles the v0 integration
    // The API will:
    // 1. Try to fork from the ecommerce template (Dpf8aaD2Wfw)
    // 2. Send the re-theming/customization prompt as a second message to the forked template
    // 3. Fallback to template-inspired approach if forking fails
    const response = await callV0API("chats", {
      message: prompt,
      modelConfiguration: {
        modelId: "v0-1.5-lg",
        imageGenerations: true,
        thinking: false,
      },
      chatPrivacy: "private",
    });

    // Extract the generated store content
    const generatedStore: GeneratedStore = {
      id: `v0-store-${response.id}`,
      generatedAt: new Date().toISOString(),
      storeData,
      v0ChatId: response.id,
      v0Url: response.url,
      demo: response.demo, // The iframe URL for preview
      content: response.text || "", // The generated store React component code
    };

    return generatedStore;
  } catch (error) {
    console.error("Error generating store with V0:", error);
    throw new Error(
      `Failed to generate store: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function regenerateStore(
  chatId: string,
  feedback: string
): Promise<GeneratedStore> {
  try {
    // Send a message to the existing chat with feedback
    const messageResponse: V0MessageResponse = await callV0API("message", {
      chatId,
      message: `Please refine the ecommerce store based on this feedback: ${feedback}`,
    });

    // Get the updated chat data
    const chatResponse = await callV0API("chat", {
      chatId,
    });

    // Extract the updated content
    let storeContent = "";

    if (messageResponse.files && messageResponse.files.length > 0) {
      const storeFile = messageResponse.files.find(
        (file: V0File) =>
          file.lang === "tsx" || file.lang === "jsx" || file.lang === "html"
      );

      storeContent = storeFile?.source || messageResponse.text || "";
    } else {
      storeContent = messageResponse.text || "";
    }

    return {
      id: `v0-store-${chatId}-updated`,
      generatedAt: new Date().toISOString(),
      storeData: {} as StoreData, // Would need to be stored/retrieved
      v0ChatId: chatId,
      v0Url: chatResponse.url,
      content: storeContent,
    };
  } catch (error) {
    console.error("Error regenerating store:", error);
    throw new Error(
      `Failed to regenerate store: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
