"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, Eye, Code, Download } from "lucide-react";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { GenerateDialog } from "./GenerateDialog";

export interface ComponentData {
  id: string;
  type: string;
  name: string;
  props: Record<string, unknown>;
  children?: ComponentData[];
  generatedCode?: string;
  v0ChatId?: string;
}

export interface PageData {
  id: string;
  name: string;
  components: ComponentData[];
}

export function Builder() {
  const [pages, setPages] = useState<PageData[]>([
    { id: "page-1", name: "Home", components: [] },
  ]);
  const [currentPageId, setCurrentPageId] = useState("page-1");
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentData | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentPage = pages.find((p) => p.id === currentPageId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Handle drag and drop logic
      console.log("Drag ended:", active.id, "over:", over.id);
    }

    setActiveId(null);
  }, []);

  const addComponent = useCallback(
    (componentData: ComponentData) => {
      setPages((prev) =>
        prev.map((page) =>
          page.id === currentPageId
            ? { ...page, components: [...page.components, componentData] }
            : page
        )
      );
    },
    [currentPageId]
  );

  const updateComponent = useCallback(
    (componentId: string, updates: Partial<ComponentData>) => {
      setPages((prev) =>
        prev.map((page) =>
          page.id === currentPageId
            ? {
                ...page,
                components: page.components.map((comp) =>
                  comp.id === componentId ? { ...comp, ...updates } : comp
                ),
              }
            : page
        )
      );
    },
    [currentPageId]
  );

  const removeComponent = useCallback(
    (componentId: string) => {
      setPages((prev) =>
        prev.map((page) =>
          page.id === currentPageId
            ? {
                ...page,
                components: page.components.filter(
                  (comp) => comp.id !== componentId
                ),
              }
            : page
        )
      );
      if (selectedComponent?.id === componentId) {
        setSelectedComponent(null);
      }
    },
    [currentPageId, selectedComponent]
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Web Builder</h1>
            <div className="flex items-center space-x-2">
              <select
                value={currentPageId}
                onChange={(e) => setCurrentPageId(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGenerateDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Component</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <Code className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex pt-16 flex-1">
          {/* Sidebar - Component Palette */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <ComponentPalette onAddComponent={addComponent} />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            <Canvas
              page={currentPage}
              selectedComponent={selectedComponent}
              onSelectComponent={setSelectedComponent}
              onUpdateComponent={updateComponent}
              onRemoveComponent={removeComponent}
            />
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <PropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={updateComponent}
            />
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-blue-100 border-2 border-blue-300 p-4 rounded-md shadow-lg">
              Dragging: {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Generate Dialog */}
      {showGenerateDialog && (
        <GenerateDialog
          isOpen={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          onGenerate={addComponent}
        />
      )}
    </div>
  );
}
