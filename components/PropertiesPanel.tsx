"use client";

import React from "react";
import { Settings, Trash2 } from "lucide-react";
import { ComponentData } from "./Builder";

interface PropertiesPanelProps {
  selectedComponent: ComponentData | null;
  onUpdateComponent: (
    componentId: string,
    updates: Partial<ComponentData>
  ) => void;
}

export function PropertiesPanel({
  selectedComponent,
  onUpdateComponent,
}: PropertiesPanelProps) {
  if (!selectedComponent) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Properties
        </h2>
        <div className="text-sm text-gray-500">
          Select a component to edit its properties
        </div>
      </div>
    );
  }

  const handlePropChange = (
    propName: string,
    value: string | number | boolean
  ) => {
    const updatedProps = { ...selectedComponent.props, [propName]: value };
    onUpdateComponent(selectedComponent.id, { props: updatedProps });
  };

  const renderPropertyInput = (propName: string, propValue: unknown) => {
    const value = propValue as string | number | boolean;

    if (typeof value === "boolean") {
      return (
        <div key={propName} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {propName}
          </label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropChange(propName, e.target.checked)}
            className="rounded border-gray-300"
          />
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div key={propName} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {propName}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) =>
              handlePropChange(propName, parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    }

    // Default to text input
    return (
      <div key={propName} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {propName}
        </label>
        <input
          type="text"
          value={value as string}
          onChange={(e) => handlePropChange(propName, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Properties
      </h2>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Component Info
        </h3>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm">
            <div>
              <strong>Type:</strong> {selectedComponent.type}
            </div>
            <div>
              <strong>Name:</strong> {selectedComponent.name}
            </div>
            <div>
              <strong>ID:</strong> {selectedComponent.id}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Properties</h3>
        {Object.entries(selectedComponent.props).map(([propName, propValue]) =>
          renderPropertyInput(propName, propValue)
        )}
      </div>

      {selectedComponent.generatedCode && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Generated Code
          </h3>
          <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
            {selectedComponent.generatedCode}
          </pre>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center space-x-2">
          <Trash2 className="w-4 h-4" />
          <span>Delete Component</span>
        </button>
      </div>
    </div>
  );
}
