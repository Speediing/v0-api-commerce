"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Building,
  Users,
  Target,
  Palette,
  MessageCircle,
  Loader2,
} from "lucide-react";

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

interface BusinessQuestionnaireProps {
  onComplete: (data: BusinessData) => void;
  isLoading: boolean;
}

const industries = [
  "E-commerce",
  "SaaS/Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "Food & Beverage",
  "Fitness & Wellness",
  "Consulting",
  "Creative Services",
  "Non-profit",
  "Other",
];

const tones = [
  "Professional",
  "Friendly",
  "Casual",
  "Luxury",
  "Playful",
  "Authoritative",
  "Trustworthy",
];

const goals = [
  "Generate leads",
  "Increase email signups",
  "Drive sales",
  "Build brand awareness",
  "Promote an event",
  "Launch a product",
  "Collect customer feedback",
];

export function BusinessQuestionnaire({
  onComplete,
  isLoading,
}: BusinessQuestionnaireProps) {
  const [formData, setFormData] = useState<BusinessData>({
    businessName: "",
    industry: "",
    targetAudience: "",
    mainGoal: "",
    keyBenefits: [""],
    callToAction: "",
    contactInfo: "",
    brandColors: {
      primary: "#007C89",
      secondary: "#FFE01B",
    },
    tone: "Professional",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 7;

  const handleInputChange = (
    field: keyof BusinessData,
    value: string | string[] | { primary: string; secondary: string }
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.keyBenefits];
    newBenefits[index] = value;
    setFormData((prev) => ({
      ...prev,
      keyBenefits: newBenefits,
    }));
  };

  const addBenefit = () => {
    if (formData.keyBenefits.length < 5) {
      setFormData((prev) => ({
        ...prev,
        keyBenefits: [...prev.keyBenefits, ""],
      }));
    }
  };

  const removeBenefit = (index: number) => {
    if (formData.keyBenefits.length > 1) {
      const newBenefits = formData.keyBenefits.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        keyBenefits: newBenefits,
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const filteredBenefits = formData.keyBenefits.filter(
      (benefit) => benefit.trim() !== ""
    );
    const finalData = {
      ...formData,
      keyBenefits: filteredBenefits,
    };
    onComplete(finalData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.businessName.trim() !== "";
      case 1:
        return formData.industry !== "";
      case 2:
        return formData.targetAudience.trim() !== "";
      case 3:
        return formData.mainGoal !== "";
      case 4:
        return formData.keyBenefits.some((benefit) => benefit.trim() !== "");
      case 5:
        return formData.callToAction.trim() !== "";
      case 6:
        return formData.tone !== "";
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-6">
              <Building className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                What&apos;s your business name?
              </h3>
            </div>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              placeholder="e.g., Acme Marketing Solutions"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-6">
              <Target className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                What industry are you in?
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => handleInputChange("industry", industry)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    formData.industry === industry
                      ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-6">
              <Users className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                Who is your target audience?
              </h3>
            </div>
            <textarea
              value={formData.targetAudience}
              onChange={(e) =>
                handleInputChange("targetAudience", e.target.value)
              }
              placeholder="e.g., Small business owners looking to grow their email list and increase sales through email marketing"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent min-h-[100px]"
              rows={4}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-6">
              <Target className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                What&apos;s your main goal for this landing page?
              </h3>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleInputChange("mainGoal", goal)}
                  className={`w-full p-3 border rounded-lg text-left transition-all ${
                    formData.mainGoal === goal
                      ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-6">
              <MessageCircle className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                What are your key benefits or selling points?
              </h3>
            </div>
            <div className="space-y-3">
              {formData.keyBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  {formData.keyBenefits.length > 1 && (
                    <button
                      onClick={() => removeBenefit(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.keyBenefits.length < 5 && (
              <button
                onClick={addBenefit}
                className="text-yellow-600 hover:text-yellow-800 text-sm"
              >
                + Add another benefit
              </button>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-6">
              <ArrowRight className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                What should your call-to-action say?
              </h3>
            </div>
            <input
              type="text"
              value={formData.callToAction}
              onChange={(e) =>
                handleInputChange("callToAction", e.target.value)
              }
              placeholder="e.g., Get Started Free, Sign Up Now, Download Guide"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <textarea
              value={formData.contactInfo}
              onChange={(e) => handleInputChange("contactInfo", e.target.value)}
              placeholder="Contact info or additional details (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              rows={3}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-yellow-600 mb-6">
              <Palette className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                Choose your brand tone and colors
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => handleInputChange("tone", tone)}
                      className={`p-2 border rounded-lg text-sm transition-all ${
                        formData.tone === tone
                          ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={formData.brandColors.primary}
                    onChange={(e) =>
                      handleInputChange("brandColors", {
                        ...formData.brandColors,
                        primary: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={formData.brandColors.secondary}
                    onChange={(e) =>
                      handleInputChange("brandColors", {
                        ...formData.brandColors,
                        secondary: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < totalSteps - 1 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center space-x-2 px-6 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isStepValid() || isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate Landing Page</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
