"use client";

import React, { useState } from "react";
import { Mail, Sparkles, Download, RotateCcw } from "lucide-react";
import { BusinessQuestionnaire } from "./BusinessQuestionnaire";
import { LandingPagePreview } from "./LandingPagePreview";
import { generateLandingPageWithV0 } from "@/lib/v0-client";

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

export function LandingPageGenerator() {
  const [step, setStep] = useState<"questionnaire" | "preview" | "editing">(
    "questionnaire"
  );
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [generatedPage, setGeneratedPage] =
    useState<GeneratedLandingPage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionnaireComplete = async (data: BusinessData) => {
    setBusinessData(data);
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateLandingPageWithV0(data);
      setGeneratedPage(result);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate landing page"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!businessData) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateLandingPageWithV0(businessData);
      setGeneratedPage(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to regenerate landing page"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setStep("questionnaire");
    setBusinessData(null);
    setGeneratedPage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-yellow-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Landing Page Generator
                </h1>
              </div>
            </div>

            {step !== "questionnaire" && (
              <button
                onClick={handleStartOver}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Over</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === "questionnaire" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-yellow-900" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Perfect Landing Page
              </h2>
              <p className="text-lg text-gray-600">
                Answer a few questions about your business and we&apos;ll
                generate a professional landing page tailored to your email
                marketing campaigns.
              </p>
            </div>

            <BusinessQuestionnaire
              onComplete={handleQuestionnaireComplete}
              isLoading={isGenerating}
            />
          </div>
        )}

        {step === "preview" && generatedPage && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Landing Page
                </h2>
                <p className="text-gray-600">
                  Generated for {businessData?.businessName}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <LandingPagePreview page={generatedPage} isLoading={isGenerating} />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700 font-medium">Error</div>
              <div className="text-red-600 text-sm mt-1">{error}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
