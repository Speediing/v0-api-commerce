"use client";

import React from "react";
import { ComponentData } from "./Builder";
import { useDraggable } from "@dnd-kit/core";
import { Settings, Trash2 } from "lucide-react";

interface ComponentRendererProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ComponentData>) => void;
  onRemove: () => void;
}

export function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onRemove,
}: ComponentRendererProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: component.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const renderComponent = () => {
    switch (component.type) {
      case "text":
        return (
          <div
            style={{
              fontSize: component.props.fontSize as string,
              color: component.props.color as string,
            }}
          >
            {component.props.content as string}
          </div>
        );

      case "button":
        return (
          <button
            className={`px-4 py-2 rounded-md ${
              component.props.variant === "primary"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            } ${
              component.props.size === "large"
                ? "px-6 py-3 text-lg"
                : component.props.size === "small"
                ? "px-2 py-1 text-sm"
                : "px-4 py-2"
            }`}
          >
            {component.props.text as string}
          </button>
        );

      case "image":
        return (
          <img
            src={component.props.src as string}
            alt={component.props.alt as string}
            style={{
              width: component.props.width as string,
              height: component.props.height as string,
            }}
            className="rounded-md border border-gray-200"
          />
        );

      case "container":
        return (
          <div
            style={{
              padding: component.props.padding as string,
              backgroundColor: component.props.backgroundColor as string,
              borderRadius: component.props.borderRadius as string,
            }}
            className="border border-gray-200 min-h-[50px]"
          >
            <div className="text-gray-500 text-sm">Container</div>
          </div>
        );

      case "hero":
        return (
          <div
            className="text-center py-16 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
            style={{
              backgroundImage: component.props.backgroundImage
                ? `url(${component.props.backgroundImage})`
                : undefined,
            }}
          >
            <h1 className="text-4xl font-bold mb-4">
              {component.props.title as string}
            </h1>
            <p className="text-xl mb-8">{component.props.subtitle as string}</p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 font-semibold">
              Get Started
            </button>
          </div>
        );

      case "grid":
        return (
          <div
            className="grid border border-gray-200 rounded-md p-4 min-h-[100px]"
            style={{
              gridTemplateColumns: `repeat(${component.props.columns}, 1fr)`,
              gap: component.props.gap as string,
            }}
          >
            {Array.from(
              { length: component.props.columns as number },
              (_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-md p-4 text-center text-sm text-gray-600"
                >
                  Grid Item {i + 1}
                </div>
              )
            )}
          </div>
        );

      default:
        // For AI-generated components, render the generated code
        if (component.generatedCode) {
          return (
            <div
              className="border border-gray-200 rounded-md p-4 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: component.generatedCode }}
            />
          );
        }
        return (
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <div className="text-gray-500 text-sm">
              Unknown component type: {component.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group ${isSelected ? "ring-2 ring-blue-500" : ""} ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={onSelect}
    >
      {renderComponent()}

      {/* Component Controls */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
