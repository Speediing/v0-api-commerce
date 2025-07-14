import { NextRequest, NextResponse } from "next/server";

interface VercelFile {
  file: string;
  data: string;
}

interface DeploymentPayload {
  name: string;
  files: VercelFile[];
  projectSettings?: {
    framework: "nextjs";
    nodeVersion: "20.x";
  };
}

export async function POST(request: NextRequest) {
  console.log("🚀 Deploy API called");
  try {
    const { chatId, projectName, storeData } = await request.json();
    console.log("📝 Request data:", { chatId, projectName });

    if (!chatId || !projectName) {
      return NextResponse.json(
        { error: "Chat ID and project name are required" },
        { status: 400 }
      );
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      return NextResponse.json(
        { error: "Vercel token not configured" },
        { status: 500 }
      );
    }

    // Get the latest chat data to extract files using v0 SDK directly
    let generatedFiles: any[] = [];
    
    try {
      const { v0 } = await import("v0-sdk");
      const chatData = await v0.chats.getById({ chatId });
      
      console.log("💬 Chat has", chatData.messages?.length, "messages");
      
      // Find the message with files (search backwards through messages)
      let messageWithFiles = null;
      for (let i = (chatData.messages?.length || 0) - 1; i >= 0; i--) {
        const message = chatData.messages?.[i];
        if (message?.files && message.files.length > 0) {
          messageWithFiles = message;
          console.log("📧 Found message with files at index", i, ":", {
            id: message.id,
            fileCount: message.files.length,
            messageText: message.text?.substring(0, 100) + "..."
          });
          break;
        }
      }
      
      if (!messageWithFiles) {
        console.log("📧 No messages with files found");
        console.log("📧 Latest message:", {
          id: chatData.messages?.[chatData.messages?.length - 1]?.id,
          hasFiles: false,
          messageText: chatData.messages?.[chatData.messages?.length - 1]?.text?.substring(0, 100) + "..."
        });
      }
      
      generatedFiles = messageWithFiles?.files || [];
      
      console.log("✅ Successfully retrieved chat data:", chatId);
      console.log("📁 Found", generatedFiles.length, "generated files");
      
      if (generatedFiles.length > 0) {
        console.log("📄 File details:", generatedFiles.map(f => ({ lang: f.lang, meta: f.meta })));
      }
    } catch (v0Error) {
      console.error("❌ Failed to get chat data from v0:", v0Error);
      // Continue with empty files array - we'll create a basic page
    }

    // Create base Next.js project structure
    const files: VercelFile[] = [
      // package.json
      {
        file: "package.json",
        data: JSON.stringify({
          name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint"
          },
          dependencies: {
            "next": "15.0.0",
            "react": "19.0.0",
            "react-dom": "19.0.0",
            "@radix-ui/react-slot": "^1.0.2",
            "class-variance-authority": "^0.7.0",
            "clsx": "^2.0.0",
            "lucide-react": "^0.263.1",
            "tailwind-merge": "^1.14.0",
            "tailwindcss-animate": "^1.0.7"
          },
          devDependencies: {
            "typescript": "^5",
            "@types/node": "^20",
            "@types/react": "^18",
            "@types/react-dom": "^18",
            "postcss": "^8",
            "tailwindcss": "^3.3.0",
            "eslint": "^8",
            "eslint-config-next": "15.0.0"
          }
        }, null, 2)
      },
      
      // Next.js config
      {
        file: "next.config.js",
        data: `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placeholder.svg'],
  },
}

module.exports = nextConfig`
      },

      // Tailwind CSS config
      {
        file: "tailwind.config.js",
        data: `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`
      },

      // PostCSS config
      {
        file: "postcss.config.js",
        data: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
      },

      // TypeScript config
      {
        file: "tsconfig.json",
        data: JSON.stringify({
          compilerOptions: {
            lib: ["dom", "dom.iterable", "es6"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [
              {
                name: "next"
              }
            ],
            baseUrl: ".",
            paths: {
              "@/*": ["./*"]
            }
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"]
        }, null, 2)
      },

      // Global CSS
      {
        file: "app/globals.css",
        data: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`
      },

      // App layout
      {
        file: "app/layout.tsx",
        data: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${storeData?.storeName || projectName}',
  description: '${storeData?.storeDescription || "Modern ecommerce store"}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`
      }
    ];

    // Add shadcn/ui components
    const uiComponents = [
      {
        file: "components/ui/button.tsx",
        data: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`
      },
      {
        file: "components/ui/card.tsx",
        data: `import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`
      },
      {
        file: "components/ui/badge.tsx",
        data: `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }`
      },
      {
        file: "lib/utils.ts",
        data: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
      }
    ];

    files.push(...uiComponents);

    // Add generated files from v0
    if (generatedFiles.length > 0) {
      generatedFiles.forEach((file: any) => {
        if (file.meta?.file && file.source) {
          files.push({
            file: file.meta.file,
            data: file.source
          });
        }
      });
    } else {
      // Fallback: create a default page.tsx if no files were generated
      files.push({
        file: "app/page.tsx",
        data: `export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center">
          Welcome to ${storeData?.storeName || projectName}
        </h1>
        <p className="text-xl text-center mt-4 text-gray-600">
          ${storeData?.storeDescription || "Your store description"}
        </p>
      </div>
    </div>
  )
}`
      });
    }

    // Create deployment payload
    const deploymentPayload: DeploymentPayload = {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      files,
      projectSettings: {
        framework: "nextjs",
        nodeVersion: "20.x"
      }
    };

    // Deploy to Vercel
    const vercelResponse = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
        ...(teamId && { "X-Vercel-Team-Id": teamId })
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!vercelResponse.ok) {
      const errorData = await vercelResponse.text();
      console.error("Vercel deployment error:", errorData);
      return NextResponse.json(
        { error: `Deployment failed: ${errorData}` },
        { status: vercelResponse.status }
      );
    }

    const deployment = await vercelResponse.json();
    
    console.log("🎉 Vercel deployment successful:", {
      id: deployment.id,
      url: deployment.url,
      status: deployment.readyState
    });

    const result = {
      success: true,
      deployment: {
        id: deployment.id,
        url: deployment.url,
        deploymentUrl: `https://${deployment.url}`,
        inspectorUrl: deployment.inspectorUrl,
        status: deployment.readyState || "QUEUED"
      }
    };
    
    console.log("📤 Returning deployment result:", result);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("Deployment error:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : "No additional details"
      },
      { status: 500 }
    );
  }
}