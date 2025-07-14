"use client";

import React from "react";
import { Loader2, Eye, ExternalLink } from "lucide-react";

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
  demo?: string;
  content: string;
  _isMock?: boolean;
}

export interface LandingPagePreviewProps {
  page: GeneratedLandingPage;
  isLoading?: boolean;
}

export function LandingPagePreview({
  page,
  isLoading,
}: LandingPagePreviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generating your landing page...
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
          <div className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm">
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </div>
        </div>

        <button
          onClick={() => window.open(page.demo || page.v0Url, "_blank")}
          disabled={!page.demo && !page.v0Url}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open in New Tab</span>
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
                {page.businessData?.businessName
                  ? page.businessData.businessName
                      .toLowerCase()
                      .replace(/\s+/g, "")
                  : "your-business"}
                .com
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6 min-h-[600px]">
            {page.demo || page.v0Url ? (
              <iframe
                src={page.demo || page.v0Url}
                className="w-full h-full min-h-[500px] border-0 rounded-lg"
                title="Landing Page Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center text-gray-500">
                  <div className="mb-2">No preview available</div>
                  <div className="text-sm">v0 iframe URL not found</div>
                  <div className="text-xs mt-2 text-red-500">
                    Expected: page.demo to contain iframe URL
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        {page._isMock && (
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
              {new Date(page.generatedAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Business:</span>
            <span className="text-gray-600 ml-2">
              {page.businessData?.businessName || "Your Business"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Industry:</span>
            <span className="text-gray-600 ml-2">
              {page.businessData?.industry || "N/A"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Goal:</span>
            <span className="text-gray-600 ml-2">
              {page.businessData?.mainGoal || "N/A"}
            </span>
          </div>
          {page.v0Url && (
            <div className="col-span-2">
              <span className="font-medium text-gray-700">v0 URL:</span>
              <a
                href={page.v0Url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-2 text-sm break-all"
              >
                {page.v0Url}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
