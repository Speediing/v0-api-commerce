"use client";

import React from "react";
import { Type, Square, Image, MousePointer, Layout, Grid } from "lucide-react";
import { ComponentData } from "./Builder";

interface ComponentPaletteProps {
  onAddComponent: (component: ComponentData) => void;
}

const componentTemplates = [
  {
    id: "text",
    name: "Text",
    icon: Type,
    type: "text",
    props: { content: "Sample text", fontSize: "16px", color: "#000000" },
  },
  {
    id: "button",
    name: "Button",
    icon: MousePointer,
    type: "button",
    props: { text: "Click me", variant: "primary", size: "medium" },
  },
  {
    id: "image",
    name: "Image",
    icon: Image,
    type: "image",
    props: {
      src: "/placeholder.jpg",
      alt: "Image",
      width: "300px",
      height: "200px",
    },
  },
  {
    id: "container",
    name: "Container",
    icon: Square,
    type: "container",
    props: { padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px" },
  },
  {
    id: "hero",
    name: "Hero Section",
    icon: Layout,
    type: "hero",
    props: {
      title: "Welcome",
      subtitle: "Build amazing websites",
      backgroundImage: "",
    },
  },
  {
    id: "grid",
    name: "Grid",
    icon: Grid,
    type: "grid",
    props: { columns: 3, gap: "16px" },
  },
];

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const handleAddComponent = (template: (typeof componentTemplates)[0]) => {
    const newComponent: ComponentData = {
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      name: template.name,
      props: { ...template.props },
    };
    onAddComponent(newComponent);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Components</h2>

      <div className="space-y-2">
        {componentTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => handleAddComponent(template)}
              className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
            >
              <Icon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">{template.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold mb-2">AI Generated</h3>
        <p className="text-xs text-gray-600 mb-3">
          Use the &ldquo;Generate Component&rdquo; button to create custom
          components with AI
        </p>
      </div>
    </div>
  );
}
