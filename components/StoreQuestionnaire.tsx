"use client";

import React, { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { type StoreData } from "@/lib/v0-client";

interface StoreQuestionnaireProps {
  onComplete: (data: StoreData) => void;
  isLoading: boolean;
}

export function StoreQuestionnaire({
  onComplete,
  isLoading,
}: StoreQuestionnaireProps) {
  const [formData, setFormData] = useState<StoreData>({
    storeName: "",
    industry: "Fashion & Apparel",
    productCategories: ["Clothing & Accessories"],
    targetAudience: "",
    storeDescription: "",
    paymentMethods: ["Stripe"],
    shippingInfo: "",
    contactInfo: "",
    brandColors: {
      primary: "#635BFF",
      secondary: "#0A2540",
    },
    storeStyle: "Modern & Minimalist",
    featuredProducts: [],
    currency: "USD ($)",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-3 text-[#635BFF] mb-6">
        <ShoppingBag className="w-6 h-6" />
        <h3 className="text-xl font-semibold">Tell us about your store</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Name
          </label>
          <input
            type="text"
            value={formData.storeName}
            onChange={(e) =>
              setFormData({ ...formData, storeName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            placeholder="Enter your store name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData({ ...formData, targetAudience: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            placeholder="e.g., Young professionals, Fashion enthusiasts"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Description
          </label>
          <textarea
            value={formData.storeDescription}
            onChange={(e) =>
              setFormData({ ...formData, storeDescription: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            placeholder="Describe what your store sells and what makes it special"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Information
          </label>
          <input
            type="text"
            value={formData.shippingInfo}
            onChange={(e) =>
              setFormData({ ...formData, shippingInfo: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            placeholder="e.g., Free shipping on orders over $50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#635BFF] text-white rounded-md hover:bg-[#5A54E8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating your store...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>Generate My Stripe Store</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}