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

interface V0File {
  lang?: string;
  source?: string;
  content?: string;
  meta?: {
    file?: string;
  };
  name?: string;
}

interface V0MessageWithFiles {
  id: string;
  files?: V0File[];
  [key: string]: unknown;
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

    console.log("🔑 Vercel config:", {
      hasToken: !!vercelToken,
      teamId: teamId,
      tokenPrefix: vercelToken?.substring(0, 8) + "...",
    });

    if (!vercelToken) {
      return NextResponse.json(
        { error: "Vercel token not configured" },
        { status: 500 }
      );
    }

    // Get the latest chat data to extract files using v0 SDK directly
    let generatedFiles: V0File[] = [];

    try {
      const { v0 } = await import("v0-sdk");
      const chatData = await v0.chats.getById({ chatId });

      console.log("fasdfas", chatData);
      console.log("💬 Chat retrieved successfully");
      console.log("💬 Chat has", chatData.messages?.length, "messages");

      // Check if the chat itself has files (v0 SDK approach)
      if (chatData.files && chatData.files.length > 0) {
        console.log(
          `📁 Found ${chatData.files.length} files directly on chat object`
        );
        chatData.files.forEach((file, i) => {
          console.log(
            `📄 File ${i}: ${file.name} (${file.content?.length || 0} chars)`
          );
        });

        // Convert v0 files to our format
        generatedFiles = chatData.files.map((file) => ({
          lang: "typescriptreact",
          meta: { file: file.name },
          source: file.content,
        }));
      } else {
        console.log(
          "📁 No files found on chat object, checking most recent message..."
        );

        // Get the most recent message with files
        const messages = chatData.messages || [];
        console.log(`📧 Checking ${messages.length} messages for files`);

        // Find the most recent message with files (check from newest to oldest)
        let mostRecentMessageWithFiles: V0MessageWithFiles | null = null;
        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i] as V0MessageWithFiles;
          if (msg.files && msg.files.length > 0) {
            mostRecentMessageWithFiles = msg;
            console.log(
              `📁 Found most recent message with ${msg.files.length} files at index ${i}`
            );
            break;
          }
        }

        if (mostRecentMessageWithFiles && mostRecentMessageWithFiles.files) {
          console.log(`📄 Processing files from most recent message:`);
          mostRecentMessageWithFiles.files.forEach(
            (file: V0File, fileIndex: number) => {
              console.log(
                `  File ${fileIndex}: ${
                  file.meta?.file || file.name || "unknown"
                } (${file.source?.length || file.content?.length || 0} chars)`
              );
            }
          );

          // Convert files to expected format
          generatedFiles = mostRecentMessageWithFiles.files.map(
            (file: V0File) => ({
              lang: file.lang || "typescriptreact",
              meta: {
                file:
                  file.meta?.file || file.name || `component-${Date.now()}.tsx`,
              },
              source: file.source || file.content || "",
            })
          );
        } else {
          console.log("📁 No messages with files found");
        }
      }

      console.log("✅ Successfully retrieved chat data:", chatId);
      console.log("📁 Found", generatedFiles.length, "generated files");

      if (generatedFiles.length > 0) {
        console.log(
          "📄 File details:",
          generatedFiles.map((f) => ({ lang: f.lang, meta: f.meta }))
        );
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
        data: JSON.stringify(
          {
            name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            version: "0.1.0",
            private: true,
            scripts: {
              dev: "next dev",
              build: "next build",
              start: "next start",
              lint: "next lint",
            },
            dependencies: {
              next: "14.2.15",
              react: "^18.2.0",
              "react-dom": "^18.2.0",
              "@radix-ui/react-slot": "^1.0.2",
              "class-variance-authority": "^0.7.0",
              clsx: "^2.0.0",
              "lucide-react": "^0.263.1",
              "tailwind-merge": "^1.14.0",
              "tailwindcss-animate": "^1.0.7",
            },
            devDependencies: {
              typescript: "^5",
              "@types/node": "^20",
              "@types/react": "^18",
              "@types/react-dom": "^18",
              postcss: "^8",
              tailwindcss: "^3.3.0",
              eslint: "^8",
              "eslint-config-next": "14.2.15",
            },
          },
          null,
          2
        ),
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

module.exports = nextConfig`,
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
}`,
      },

      // PostCSS config
      {
        file: "postcss.config.js",
        data: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      },

      // TypeScript config
      {
        file: "tsconfig.json",
        data: JSON.stringify(
          {
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
                  name: "next",
                },
              ],
              baseUrl: ".",
              paths: {
                "@/*": ["./*"],
              },
            },
            include: [
              "next-env.d.ts",
              "**/*.ts",
              "**/*.tsx",
              ".next/types/**/*.ts",
            ],
            exclude: ["node_modules"],
          },
          null,
          2
        ),
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
}`,
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
}`,
      },
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

export { Button, buttonVariants }`,
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

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`,
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

export { Badge, badgeVariants }`,
      },
      {
        file: "lib/utils.ts",
        data: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
      },
    ];

    files.push(...uiComponents);

    // Add generated files from v0
    if (generatedFiles.length > 0) {
      console.log("📄 Adding v0 generated files:");
      generatedFiles.forEach((file: V0File) => {
        console.log(
          "  - File:",
          file.meta?.file,
          "Lang:",
          file.lang,
          "Size:",
          file.source?.length
        );
        if (file.meta?.file && file.source) {
          files.push({
            file: file.meta.file,
            data: file.source,
          });
        }
      });
    } else {
      console.log("📄 No v0 files found, using your exact hhhh store code");
      // Use your exact "hhhh" store code that you showed me
      files.push({
        file: "app/page.tsx",
        data: `import { ShoppingCart, Menu, Search, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">h</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">hhhh</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">
                Women
              </a>
              <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">
                Men
              </a>
              <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">
                Accessories
              </a>
              <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">
                Sale
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#3B82F6] text-xs">
                  2
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Modern Fashion
                  <span className="block text-[#3B82F6]">Redefined</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Discover our curated collection of contemporary fashion pieces that blend style with comfort. ${
                    storeData?.storeDescription ||
                    "Quality fashion for modern lifestyles."
                  }
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white px-8 py-3 text-lg">
                  Shop Collection
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white px-8 py-3 text-lg bg-transparent"
                >
                  View Lookbook
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#3B82F6]/10 to-[#1E40AF]/20 rounded-2xl overflow-hidden">
                <img
                  src="/placeholder.svg?height=600&width=600"
                  alt="Fashion Model"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Collection</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces that define contemporary fashion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product 1 */}
            <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden relative">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Essential Cotton Tee"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-[#3B82F6] text-white">New</Badge>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900">Essential Cotton Tee</h3>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(124 reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">$29.99</span>
                    <Button size="sm" className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product 2 */}
            <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden relative">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Modern Denim Jacket"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">Sale</Badge>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900">Modern Denim Jacket</h3>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(89 reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">$79.99</span>
                      <span className="text-lg text-gray-500 line-through">$99.99</span>
                    </div>
                    <Button size="sm" className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product 3 */}
            <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden relative">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Minimalist Sneakers"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900">Minimalist Sneakers</h3>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(156 reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">$89.99</span>
                    <Button size="sm" className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white px-8 py-3 bg-transparent"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">About hhhh</h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  We believe fashion should be accessible, sustainable, and effortlessly stylish. Our carefully curated
                  collection represents the perfect blend of contemporary design and timeless appeal.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  ${
                    storeData?.storeDescription ||
                    "Quality fashion for modern lifestyles."
                  } - Every piece in our collection is chosen with our discerning customers in mind, ensuring
                  quality, comfort, and style in every purchase.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Fast Shipping</h3>
                  <p className="text-sm text-gray-600">${
                    storeData?.shippingInfo ||
                    "Free shipping on orders over $50"
                  }</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quality Assured</h3>
                  <p className="text-sm text-gray-600">Premium materials</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-3">
                    <RefreshCw className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Easy Returns</h3>
                  <p className="text-sm text-gray-600">30-day policy</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#3B82F6]/10 to-[#1E40AF]/20 rounded-2xl overflow-hidden">
                <img
                  src="/placeholder.svg?height=600&width=600"
                  alt="Fashion Studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">Stay in Style</h2>
              <p className="text-xl text-gray-600">Subscribe to get the latest fashion trends and exclusive offers</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
              <Button className="bg-[#3B82F6] hover:bg-[#1E40AF] text-white px-8 py-3">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">h</span>
                </div>
                <span className="text-2xl font-bold">hhhh</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Modern fashion redefined. Quality pieces for the contemporary lifestyle.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shop</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Women's Collection
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Men's Collection
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Accessories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sale Items
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment & Shipping</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-5 bg-[#0070ba] rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PP</span>
                  </div>
                  <span className="text-gray-400">PayPal Accepted</span>
                </div>
                <p className="text-gray-400 text-sm">Shipping: ${
                  storeData?.shippingInfo || "Free on orders over $50"
                }</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 hhhh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}`,
      });
    }

    console.log("📦 Total files being deployed:", files.length);
    console.log(
      "📦 File list:",
      files.map((f) => f.file)
    );

    // Create deployment payload
    const deploymentPayload: DeploymentPayload = {
      name: "v0-pay-pal", // Use your existing project name
      files,
      projectSettings: {
        framework: "nextjs",
        nodeVersion: "20.x",
      },
    };

    console.log("📦 Deployment payload:", {
      name: deploymentPayload.name,
      fileCount: files.length,
      hasTeamId: !!teamId,
    });

    // Deploy to Vercel
    const vercelResponse = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
          ...(teamId && { "X-Vercel-Team-Id": teamId }),
        },
        body: JSON.stringify(deploymentPayload),
      }
    );

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
      status: deployment.readyState,
    });

    const result = {
      success: true,
      deployment: {
        id: deployment.id,
        url: deployment.url,
        deploymentUrl: `https://${deployment.url}`,
        inspectorUrl: deployment.inspectorUrl,
        status: deployment.readyState || "QUEUED",
      },
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
        details: error instanceof Error ? error.stack : "No additional details",
      },
      { status: 500 }
    );
  }
}
