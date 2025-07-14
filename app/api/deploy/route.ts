import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

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
    title?: string;
  };
  name?: string;
}

interface V0MessageWithFiles {
  id: string;
  files?: V0File[];
  [key: string]: unknown;
}

// Function to recursively read files from default folder
async function readDefaultFiles(basePath: string): Promise<VercelFile[]> {
  const files: VercelFile[] = [];
  
  try {
    const defaultPath = path.join(basePath, "default");
    await readFilesRecursively(defaultPath, "", files);
    console.log(`📁 Read ${files.length} files from default folder`);
  } catch (error) {
    console.log("📁 No default folder found or error reading:", error);
  }
  
  return files;
}

async function readFilesRecursively(
  dirPath: string,
  relativePath: string,
  files: VercelFile[]
): Promise<void> {
  try {
    const items = await readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const relativeFilePath = relativePath ? `${relativePath}/${item.name}` : item.name;
      
      if (item.isDirectory()) {
        await readFilesRecursively(fullPath, relativeFilePath, files);
      } else if (item.isFile()) {
        // Skip certain files
        if (item.name.startsWith('.') || item.name === 'node_modules') {
          continue;
        }
        
        try {
          const content = await readFile(fullPath, 'utf8');
          files.push({
            file: relativeFilePath,
            data: content
          });
        } catch (readError) {
          console.log(`⚠️ Could not read file ${relativeFilePath}:`, readError);
        }
      }
    }
  } catch (error) {
    console.log(`⚠️ Error reading directory ${dirPath}:`, error);
  }
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
    
    // Read existing files from default folder
    const defaultFiles = await readDefaultFiles(process.cwd());

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
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;`,
      },

      // TypeScript config
      {
        file: "tsconfig.json",
        data: JSON.stringify(
          {
            compilerOptions: {
              target: "es5",
              lib: ["dom", "dom.iterable", "es6"],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              forceConsistentCasingInFileNames: true,
              noEmit: true,
              esModuleInterop: true,
              module: "esnext",
              moduleResolution: "node",
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: "preserve",
              incremental: true,
              plugins: [
                {
                  name: "next",
                },
              ],
              paths: {
                "@/*": ["./*"],
              },
            },
            include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            exclude: ["node_modules"],
          },
          null,
          2
        ),
      },

      // Tailwind config
      {
        file: "tailwind.config.js",
        data: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
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

      // Global CSS
      {
        file: "app/globals.css",
        data: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      },

      // Root layout
      {
        file: "app/layout.tsx",
        data: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${projectName}",
  description: "Generated by v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
      },
    ];

    // Add basic UI components
    const uiComponents = [
      {
        file: "components/ui/button.tsx",
        data: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
            "border border-input hover:bg-accent hover:text-accent-foreground": variant === 'outline',
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
            "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
            "underline-offset-4 hover:underline text-primary": variant === 'link',
          },
          {
            "h-10 py-2 px-4": size === 'default',
            "h-9 px-3 rounded-md": size === 'sm',
            "h-11 px-8 rounded-md": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };`,
      },
      {
        file: "components/ui/card.tsx",
        data: `import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };`,
      },
      {
        file: "components/ui/badge.tsx",
        data: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === 'default',
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === 'destructive',
          "text-foreground": variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };`,
      },
      {
        file: "lib/utils.ts",
        data: `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
      },
    ];

    files.push(...uiComponents);

    // Start with default files as base
    const mergedFiles = new Map<string, string>();
    
    // Add all default files first
    console.log("📄 Adding default files as base:");
    defaultFiles.forEach((file) => {
      console.log("  - Default file:", file.file);
      mergedFiles.set(file.file, file.data);
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
          console.log(`    -> ${mergedFiles.has(fileName) ? 'Overwriting' : 'Adding'} ${fileName}`);
          mergedFiles.set(fileName, file.source);
        }
      });
    }
    
    // Add merged files to the deployment
    mergedFiles.forEach((data, fileName) => {
      files.push({
        file: fileName,
        data: data
      });
    });
    
    console.log("📄 File merging complete. Generated files:", generatedFiles.length, "Default files:", defaultFiles.length);

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
      hasFiles: files.length > 0,
    });

    // Deploy to Vercel
    const response = await fetch(
      `https://api.vercel.com/v13/deployments${teamId ? `?teamId=${teamId}` : ""}`,
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
      throw new Error(`Vercel deployment failed: ${response.status} ${errorText}`);
    }

    const deployment = await response.json();
    console.log("✅ Deployment successful:", deployment);

    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment.id,
        url: deployment.url,
        deploymentUrl: `https://${deployment.url}`,
        status: deployment.readyState || deployment.status,
        inspectorUrl: `https://vercel.com/${teamId ? `${teamId}/` : ""}${deployment.name}/${deployment.id}`,
      },
    });
  } catch (error) {
    console.error("❌ Deployment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown deployment error",
      },
      { status: 500 }
    );
  }
}