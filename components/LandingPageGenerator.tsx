"use client";

import React, { useState } from "react";
import { ShoppingBag, Sparkles, Download, RotateCcw } from "lucide-react";
import { StoreQuestionnaire } from "./StoreQuestionnaire";
import { StorePreview } from "./StorePreview";
import { generateStoreWithV0, regenerateStore, type StoreData, type GeneratedStore } from "@/lib/v0-client";

export function StoreGenerator() {
  const [step, setStep] = useState<"questionnaire" | "preview" | "editing">(
    "questionnaire"
  );
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [generatedStore, setGeneratedStore] =
    useState<GeneratedStore | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionnaireComplete = async (data: StoreData) => {
    setStoreData(data);
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateStoreWithV0(data);
      console.log("🔍 Generated store result:", result);
      console.log("🔍 Generated store files:", result.files);
      setGeneratedStore(result);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate store"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!storeData) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateStoreWithV0(storeData);
      console.log("🔍 Regenerated store result:", result);
      console.log("🔍 Regenerated store files:", result.files);
      setGeneratedStore(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to regenerate store"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setStep("questionnaire");
    setStoreData(null);
    setGeneratedStore(null);
    setError(null);
  };

  const handleRefineStore = async (feedback: string) => {
    if (!generatedStore?.v0ChatId) return;

    setIsRefining(true);
    setError(null);

    try {
      const refinedStore = await regenerateStore(
        generatedStore.v0ChatId, 
        feedback, 
        generatedStore
      );
      console.log("🔍 Refined store result:", refinedStore);
      console.log("🔍 Refined store files:", refinedStore.files);
      setGeneratedStore(refinedStore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refine store"
      );
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#635BFF] rounded-md flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Stripe Store Builder
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
              <div className="w-16 h-16 bg-[#F6F9FC] border-2 border-[#635BFF] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#635BFF]" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Build Your Stripe Store
              </h2>
              <p className="text-lg text-gray-600">
                Answer a few questions about your store and we&apos;ll
                generate a professional ecommerce website with integrated
                Stripe payments ready to sell your products.
              </p>
            </div>

            <StoreQuestionnaire
              onComplete={handleQuestionnaireComplete}
              isLoading={isGenerating}
            />
          </div>
        )}

        {step === "preview" && generatedStore && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Stripe Store
                </h2>
                <p className="text-gray-600">
                  Generated for {storeData?.storeName}
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

                <button className="flex items-center space-x-2 px-4 py-2 bg-[#635BFF] text-white rounded-md hover:bg-[#5A54E8]">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <StorePreview 
              store={generatedStore} 
              isLoading={isGenerating}
              onRefine={handleRefineStore}
              isRefining={isRefining}
            />
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
