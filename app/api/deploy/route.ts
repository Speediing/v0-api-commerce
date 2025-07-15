import { NextRequest, NextResponse } from "next/server";

// Embedded default project files - these are included at build time
const defaultProjectFiles = {
  // Root configuration files
  "package.json": `{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "15.2.4",
    "next-themes": "^0.4.4",
    "react": "^19",
    "react-day-picker": "^9.0.0",
    "react-dom": "^19",
    "react-hook-form": "^7.54.1",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.6",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8.5",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}`,

  "pnpm-lock.yaml": `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false`,

  "next.config.mjs": `/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig`,

  "tsconfig.json": `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,

  "tailwind.config.ts": `import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;`,

  "postcss.config.mjs": `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;`,

  "components.json": `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}`,

  // App directory
  "app/layout.tsx": `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,

  "app/page.tsx": `import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">Store</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">New</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Women</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Men</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Sale</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">2</Badge>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-light text-gray-900 leading-tight">
                Discover Your
                <span className="block text-blue-600 font-normal">Perfect Style</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Curated fashion pieces that define your unique aesthetic.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Shop Now
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg">
                  View Collection
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="Fashion collection"
                width={500}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-light text-gray-900 mb-4">Featured Collection</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces that embody modern elegance and timeless appeal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Essential Tee",
                price: "$29",
                originalPrice: "$39",
                image: "/placeholder.svg?height=400&width=300",
                badge: "Sale",
              },
              {
                name: "Classic Jacket",
                price: "$89",
                originalPrice: null,
                image: "/placeholder.svg?height=400&width=300",
                badge: "New",
              },
              {
                name: "Casual Pants",
                price: "$79",
                originalPrice: "$99",
                image: "/placeholder.svg?height=400&width=300",
                badge: "Best Seller",
              },
              {
                name: "Summer Dress",
                price: "$65",
                originalPrice: null,
                image: "/placeholder.svg?height=400&width=300",
                badge: null,
              },
            ].map((product, index) => (
              <Card key={index} className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={400}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <Badge className={\`absolute top-3 left-3 \${product.badge === "Sale" ? "bg-red-500" : product.badge === "New" ? "bg-blue-600" : "bg-green-500"}\`}>
                        {product.badge}
                      </Badge>
                    )}
                    <Button size="icon" variant="secondary" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-blue-600">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">(24)</span>
                    </div>
                    <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h4 className="text-2xl font-bold text-blue-600 mb-4">Store</h4>
            <p className="text-gray-600 mb-8">Modern fashion for the contemporary lifestyle.</p>
            <div className="text-sm text-gray-500">
              <p>Secure payments powered by PayPal</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}`,

  "app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
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

  "app/loading.tsx": `export default function Loading() {
  return null
}`,

  // Essential UI components
  "components/ui/button.tsx": `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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

  "components/ui/card.tsx": `import * as React from "react"

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
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
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
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
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

  "components/ui/badge.tsx": `import * as React from "react"
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

  // Lib/utils
  "lib/utils.ts": `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
};

interface VercelFile {
  file: string;
  data: string;
}

interface DeploymentPayload {
  name: string;
  files: VercelFile[];
  target?: "production";
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
    title?: string;
  };
  name?: string;
}

interface V0MessageWithFiles {
  id: string;
  files?: V0File[];
  [key: string]: unknown;
}

// Function to get embedded default files
function getDefaultFiles(): VercelFile[] {
  const files: VercelFile[] = [];

  Object.entries(defaultProjectFiles).forEach(([filePath, content]) => {
    files.push({
      file: filePath,
      data: content,
    });
  });

  console.log(`📁 Using ${files.length} embedded default files`);
  return files;
}

export async function POST(request: NextRequest) {
  console.log("🚀 Deploy API called");
  try {
    const {
      chatId,
      projectName,
      storeData,
      generatedFiles: passedFiles,
    } = await request.json();
    console.log("📝 Request data:", { chatId, projectName });
    console.log("📝 Passed files from UI:", passedFiles);
    console.log("📝 Passed files count:", passedFiles?.length || 0);

    if (!chatId || !projectName) {
      return NextResponse.json(
        { error: "Chat ID and project name are required" },
        { status: 400 }
      );
    }

    const vercelToken = process.env.V_TOKEN;
    const teamId = process.env.V_TEAM_ID;

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

    // Get v0 generated files - prioritize passed files over fetched ones
    let generatedFiles: V0File[] = [];

    // Get embedded default files
    const defaultFiles = getDefaultFiles();

    // First, check if files were passed directly from the UI state
    if (passedFiles && passedFiles.length > 0) {
      console.log(
        `📁 Using ${passedFiles.length} files passed directly from UI state`
      );
      generatedFiles = passedFiles.map((file: V0File) => ({
        lang: file.lang || "typescriptreact",
        meta: {
          file:
            file.meta?.file ||
            file.name ||
            file.meta?.title?.replace(/\s+/g, "-").toLowerCase() + ".tsx" ||
            `component-${Date.now()}.tsx`,
        },
        source: file.source || file.content || "",
      }));

      generatedFiles.forEach((file, i) => {
        console.log(
          `📄 Passed File ${i}: ${file.meta?.file} (${
            file.source?.length || 0
          } chars)`
        );
      });
    } else {
      // Fallback to fetching from v0 chat if no files were passed
      console.log("📁 No files passed from UI, fetching from v0 chat...");

      try {
        const { v0 } = await import("v0-sdk");
        const chatData = await v0.chats.getById({ chatId });

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
                    file.meta?.file ||
                    file.name ||
                    file.meta?.title?.replace(/\s+/g, "-").toLowerCase() +
                      ".tsx" ||
                    `component-${Date.now()}.tsx`,
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
    }

    // Initialize files array - will be populated from default directory and v0 generated files
    const files: VercelFile[] = [];

    // Start with default files as base
    const mergedFiles = new Map<string, string>();

    // Add all default files first
    console.log("📄 Adding default files as base:");
    defaultFiles.forEach((file) => {
      console.log("  - Default file:", file.file);
      let fileData = file.data;

      // Customize package.json with project name
      if (file.file === "package.json") {
        try {
          const packageData = JSON.parse(file.data);
          packageData.name = projectName
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-");
          packageData.description = `Generated by v0.dev - ${projectName}`;
          fileData = JSON.stringify(packageData, null, 2);
        } catch (e) {
          console.log("    -> Could not parse package.json, using as-is");
        }
      }

      // Customize layout.tsx with project name
      if (file.file === "app/layout.tsx") {
        fileData = file.data.replace(
          /title: "[^"]*"/,
          `title: "${projectName}"`
        );
      }

      mergedFiles.set(file.file, fileData);
    });

    // Merge v0 generated files (they will overwrite default files if same path)
    if (generatedFiles.length > 0) {
      console.log("📄 Merging v0 generated files (will overwrite defaults):");
      generatedFiles.forEach((file: V0File) => {
        console.log(
          "  - V0 file:",
          file.meta?.file,
          "Lang:",
          file.lang,
          "Size:",
          file.source?.length
        );
        if (file.meta?.file && file.source) {
          const fileName = file.meta.file;
          console.log(
            `    -> ${
              mergedFiles.has(fileName) ? "Overwriting" : "Adding"
            } ${fileName}`
          );
          mergedFiles.set(fileName, file.source);
        }
      });
    }

    // Add merged files to the deployment
    mergedFiles.forEach((data, fileName) => {
      files.push({
        file: fileName,
        data: data,
      });
    });

    console.log(
      "📄 File merging complete. Generated files:",
      generatedFiles.length,
      "Default files:",
      defaultFiles.length
    );

    console.log("📦 Total files being deployed:", files.length);
    console.log(
      "📦 File list:",
      files.map((f) => f.file)
    );

    // Create deployment payload
    const deploymentPayload: DeploymentPayload = {
      name: "v0-pay-pal", // Use your existing project name
      files,
      target: "production",
      projectSettings: {
        framework: "nextjs",
        nodeVersion: "20.x",
      },
    };

    console.log("📦 Deployment payload:", {
      name: deploymentPayload.name,
      fileCount: files.length,
      hasFiles: files.length > 0,
    });

    // Deploy to Vercel
    const response = await fetch(
      `https://api.vercel.com/v13/deployments${
        teamId ? `?teamId=${teamId}` : ""
      }`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deploymentPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Vercel deployment failed:", errorText);
      throw new Error(
        `Vercel deployment failed: ${response.status} ${errorText}`
      );
    }

    const deployment = await response.json();
    console.log("✅ Deployment successful:", deployment);

    // Get the primary URL, handling cases where URL might be an array or comma-separated
    let primaryUrl = deployment.alias || deployment.url;
    if (Array.isArray(primaryUrl)) {
      primaryUrl = primaryUrl[0];
    } else if (typeof primaryUrl === 'string' && primaryUrl.includes(',')) {
      primaryUrl = primaryUrl.split(',')[0];
    }

    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment.id,
        url: primaryUrl,
        deploymentUrl: `https://${primaryUrl}`,
        status: deployment.readyState || deployment.status,
        inspectorUrl: `https://vercel.com/${teamId ? `${teamId}/` : ""}${
          deployment.name
        }/${deployment.id}`,
      },
    });
  } catch (error) {
    console.error("❌ Deployment error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown deployment error",
      },
      { status: 500 }
    );
  }
}
