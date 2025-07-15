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
      const relativeFilePath = relativePath
        ? `${relativePath}/${item.name}`
        : item.name;

      if (item.isDirectory()) {
        await readFilesRecursively(fullPath, relativeFilePath, files);
      } else if (item.isFile()) {
        // Skip certain files
        if (item.name.startsWith(".") || item.name === "node_modules") {
          continue;
        }

        try {
          const content = await readFile(fullPath, "utf8");
          files.push({
            file: relativeFilePath,
            data: content,
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

    // Read existing files from default folder
    const defaultFiles = await readDefaultFiles(process.cwd());

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

    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment.id,
        url: deployment.url,
        deploymentUrl: `https://${deployment.url}`,
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
