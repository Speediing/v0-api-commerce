"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { ComponentData, PageData } from "./Builder";
import { ComponentRenderer } from "./ComponentRenderer";

interface CanvasProps {
  page?: PageData;
  selectedComponent: ComponentData | null;
  onSelectComponent: (component: ComponentData | null) => void;
  onUpdateComponent: (
    componentId: string,
    updates: Partial<ComponentData>
  ) => void;
  onRemoveComponent: (componentId: string) => void;
}

export function Canvas({
  page,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onRemoveComponent,
}: CanvasProps) {
  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">No page selected</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Canvas Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold">{page.name}</h2>
        <p className="text-sm text-gray-600">
          {page.components.length} components
        </p>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 p-8 bg-gray-50 overflow-auto">
        <div
          ref={setNodeRef}
          className="max-w-4xl mx-auto min-h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          {page.components.length === 0 ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mb-2">Drop components here</div>
                <div className="text-sm text-gray-500">
                  Drag components from the palette or generate new ones with AI
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {page.components.map((component) => (
                <ComponentRenderer
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  onSelect={() => onSelectComponent(component)}
                  onUpdate={(updates: Partial<ComponentData>) =>
                    onUpdateComponent(component.id, updates)
                  }
                  onRemove={() => onRemoveComponent(component.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
