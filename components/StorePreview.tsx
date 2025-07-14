"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Eye,
  ExternalLink,
  Send,
  MessageCircle,
  Clock,
  Rocket,
  Code,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { type GeneratedStore } from "@/lib/v0-client";

interface DeploymentResult {
  error?: string;
  deploymentUrl?: string;
  status?: string;
  id?: string;
  inspectorUrl?: string;
}

export interface StorePreviewProps {
  store: GeneratedStore;
  isLoading?: boolean;
  onRefine?: (feedback: string) => void;
  isRefining?: boolean;
  onDeploy?: (deploymentInfo: DeploymentResult) => void;
}

export function StorePreview({
  store,
  isLoading,
  onRefine,
  isRefining,
  onDeploy,
}: StorePreviewProps) {
  const [refinementMessage, setRefinementMessage] = useState("");
  const [showRefinement, setShowRefinement] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] =
    useState<DeploymentResult | null>(null);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Set generated files from store data
  useEffect(() => {
    if (store.files && store.files.length > 0) {
      const files = store.files.map((file, index) => ({
        name: file.meta?.file || file.name || file.meta?.title || `component-${index + 1}.tsx`,
        content: file.source || file.content || '',
        lang: file.lang || 'typescriptreact'
      }));
      setGeneratedFiles(files);
    } else {
      setGeneratedFiles([]);
    }
  }, [store.files]);

  const handleCopyFile = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinementMessage.trim() && onRefine) {
      onRefine(refinementMessage.trim());
      setRefinementMessage("");
    }
  };

  const handleDeploy = async () => {
    if (!store.v0ChatId || !store.storeData?.storeName) return;
    console.log(store);
    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: "jNT7o1DwPZL", // Use the chat with your actual hhhh store
          projectName: store.storeData.storeName,
          storeData: store.storeData,
        }),
      });

      const result = await response.json();
      console.log("🔍 Deploy response:", result);

      if (result.success) {
        console.log(
          "✅ Deployment successful, setting result:",
          result.deployment
        );
        setDeploymentResult(result.deployment);
        if (onDeploy) {
          onDeploy(result.deployment);
        }
      } else {
        console.log("❌ Deployment failed:", result.error);
        throw new Error(result.error || "Deployment failed");
      }
    } catch (error) {
      console.error("Deployment error:", error);
      setDeploymentResult({
        error:
          error instanceof Error ? error.message : "Unknown deployment error",
      });
    } finally {
      setIsDeploying(false);
    }
  };
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generating your store...
            </h3>
            <p className="text-gray-600">
              This may take a few moments while we create your custom design.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center space-x-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowCodeViewer(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              !showCodeViewer 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => setShowCodeViewer(true)}
            disabled={generatedFiles.length === 0}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
              showCodeViewer 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Code ({generatedFiles.length})</span>
          </button>
        </div>

        <button
          onClick={() => window.open(store.demo || store.v0Url, "_blank")}
          disabled={!store.demo && !store.v0Url}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ExternalLink className="w-4 h-4" />
          <span>{store.demo ? "Open Preview" : "View in v0.dev"}</span>
        </button>

        <button
          onClick={handleDeploy}
          disabled={isDeploying || !store.v0ChatId}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deploying...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Deploy to Vercel</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          {/* Browser Chrome */}
          <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 border-b">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-sm text-gray-600">
                {showCodeViewer ? (
                  <span className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Generated Code Files</span>
                  </span>
                ) : (
                  <>
                    {store.storeData?.storeName
                      ? store.storeData.storeName.toLowerCase().replace(/\s+/g, "")
                      : "your-store"}
                    .com
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          {showCodeViewer ? (
            <div className="min-h-[600px]">
              {generatedFiles.length > 0 ? (
                <div className="flex h-full">
                  {/* File Tabs */}
                  <div className="w-64 border-r border-gray-200 bg-gray-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Files</h3>
                    </div>
                    <div className="overflow-y-auto">
                      {generatedFiles.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveFileIndex(index)}
                          className={`w-full text-left px-4 py-3 text-sm border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                            activeFileIndex === index
                              ? "bg-blue-50 text-blue-700 border-l-4 border-l-blue-500"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {file.lang}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Content */}
                  <div className="flex-1 flex flex-col">
                    {generatedFiles[activeFileIndex] && (
                      <>
                        {/* File Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {generatedFiles[activeFileIndex].name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyFile(
                              generatedFiles[activeFileIndex].content,
                              generatedFiles[activeFileIndex].name
                            )}
                            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            {copiedFile === generatedFiles[activeFileIndex].name ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Code Display */}
                        <div className="flex-1 overflow-auto">
                          <pre className="p-4 text-sm text-gray-800 bg-gray-50 h-full overflow-auto">
                            <code className="whitespace-pre-wrap">
                              {generatedFiles[activeFileIndex].content}
                            </code>
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[500px] text-gray-500">
                  <div className="text-center">
                    <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-medium mb-2">No code files found</div>
                    <div className="text-sm">
                      Generate a store first to see the code files
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 min-h-[600px]">
              {store.demo ? (
                <iframe
                  src={store.demo}
                  className="w-full h-full min-h-[500px] border-0 rounded-lg"
                  title="Store Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center text-gray-500">
                    <div className="mb-2">Preview not available</div>
                    <div className="text-sm">
                      {store._isMock
                        ? "Using mock data - set V0_API_KEY environment variable to see real preview"
                        : "Demo URL not provided by v0 SDK (check console logs for debugging)"}
                    </div>
                    {store.v0Url && (
                      <div className="mt-3">
                        <a
                          href={store.v0Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          View in v0.dev instead →
                        </a>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      Expected: chat.demo from v0 SDK
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Page Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        {store._isMock && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-yellow-800 text-sm font-medium">
              ⚠️ Using Mock Data
            </div>
            <div className="text-yellow-700 text-sm mt-1">
              Set V0_API_KEY environment variable to use the real v0 API.
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Generated:</span>
            <span className="text-gray-600 ml-2">
              {new Date(store.generatedAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Store:</span>
            <span className="text-gray-600 ml-2">
              {store.storeData?.storeName || "Your Store"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Industry:</span>
            <span className="text-gray-600 ml-2">
              {store.storeData?.industry || "N/A"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Style:</span>
            <span className="text-gray-600 ml-2">
              {store.storeData?.storeStyle || "N/A"}
            </span>
          </div>
          {store.v0Url && (
            <div className="col-span-2">
              <span className="font-medium text-gray-700">v0 URL:</span>
              <a
                href={store.v0Url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-2 text-sm break-all"
              >
                {store.v0Url}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Deployment Result */}
      {deploymentResult && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {deploymentResult.error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700 font-medium">Deployment Failed</div>
              <div className="text-red-600 text-sm mt-1">
                {deploymentResult.error}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-700 font-medium mb-3">
                🚀 Deployment Successful!
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Live URL:</span>
                  <a
                    href={deploymentResult.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 ml-2 underline"
                  >
                    {deploymentResult.deploymentUrl}
                  </a>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-green-600">
                    {deploymentResult.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Deployment ID:
                  </span>
                  <span className="ml-2 text-gray-600 font-mono text-xs">
                    {deploymentResult.id}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() =>
                    window.open(deploymentResult.deploymentUrl, "_blank")
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Live Site</span>
                </button>
                {deploymentResult.inspectorUrl && (
                  <button
                    onClick={() =>
                      window.open(deploymentResult.inspectorUrl, "_blank")
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View in Vercel</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refinement Interface */}
      {onRefine && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Refine Your Store
              </h3>
            </div>
            <button
              onClick={() => setShowRefinement(!showRefinement)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showRefinement ? "Hide" : "Show"}
            </button>
          </div>

          {showRefinement && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Tell us what you&apos;d like to change about your store. For
                example: &quot;Make it more colorful&quot;, &quot;Add a
                testimonials section&quot;, &quot;Change the layout&quot;, etc.
              </p>

              <form onSubmit={handleRefine} className="space-y-3">
                <textarea
                  value={refinementMessage}
                  onChange={(e) => setRefinementMessage(e.target.value)}
                  placeholder="Describe the changes you'd like to make..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={isRefining}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!refinementMessage.trim() || isRefining}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefining ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Refining...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Refinement</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Refinement History */}
              {store.refinements && store.refinements.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Refinement History ({store.refinements.length})
                  </h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {store.refinements
                      .slice()
                      .reverse()
                      .map((refinement) => (
                        <div
                          key={refinement.id}
                          className="bg-gray-50 rounded-md p-3 text-sm"
                        >
                          <div className="text-gray-700 font-medium mb-1">
                            Request:
                          </div>
                          <div className="text-gray-600 mb-2">
                            &quot;{refinement.message}&quot;
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(refinement.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
