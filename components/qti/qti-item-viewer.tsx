"use client";

/**
 * QTI Item Viewer Component
 *
 * A React wrapper component for displaying QTI assessment items.
 * Handles XML parsing, transformation, and rendering of QTI content.
 *
 * Usage:
 *   <QtiItemViewer
 *     itemXML={qtiXmlString}
 *     className="w-full p-4"
 *     onItemLoaded={() => console.log("Item loaded")}
 *     onError={(error) => console.error(error)}
 *   />
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { qtiTransformItem } from "@citolab/qti-components/qti-transformers";
import type { QtiItem, QtiAssessmentItem } from "./qti-types";
import type { QtiItemViewerProps } from "./qti-types";
import { useQtiReady } from "./qti-context";

export default function QtiItemViewer({
  itemXML,
  className = "",
  onItemLoaded,
  onError,
  onResponseChange,
}: QtiItemViewerProps) {
  const { isReady: isQtiReady } = useQtiReady();
  const qtiItemRef = useRef<QtiItem>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformedXML, setTransformedXML] = useState<Document | DocumentFragment | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transform QTI XML for display - wait for QTI components to be ready
  useEffect(() => {
    if (!itemXML) {
      setIsLoading(false);
      return;
    }

    // Wait for QTI components to be initialized before transforming
    if (!isQtiReady) {
      setIsLoading(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Transform XML using QTI transformers
      const transformed = qtiTransformItem()
        .parse(itemXML)
        .extendElementsWithClass("type")
        .convertCDATAtoComment()
        .htmlDoc();

      setTransformedXML(transformed);
      setIsLoading(false);

      onItemLoaded?.();
    } catch (err) {
      const parseError = err instanceof Error ? err : new Error("Failed to parse QTI XML");
      setError(parseError);
      setIsLoading(false);

      onError?.(parseError);

      console.error("QTI XML parsing error:", parseError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemXML, isQtiReady]); // Re-run when XML changes or QTI becomes ready

  // Listen for QTI item connected event
  const handleItemConnected = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<QtiAssessmentItem>;
      const assessmentItem = customEvent.detail;

      console.log("QTI Assessment Item connected:", assessmentItem);

      // You can interact with the assessment item here
      // For example, set response variables, show correct responses, etc.
    },
    []
  );

  // Handle response changes from QTI interactions
  // The correct event is 'qti-item-context-updated' which contains itemContext.variables
  const handleContextUpdated = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;

      console.log("[QtiItemViewer] qti-item-context-updated received:", detail);

      if (detail && onResponseChange) {
        // Extract response from itemContext.variables
        const itemContext = detail.itemContext || detail;
        const variables = itemContext?.variables || [];

        // Find the first response variable (usually RESPONSE)
        const responseVar = variables.find((v: { type?: string; identifier?: string }) =>
          v.type === 'RESPONSE' || v.identifier === 'RESPONSE' || v.identifier?.startsWith('RESPONSE')
        );

        if (responseVar && responseVar.value != null) {
          console.log("[QtiItemViewer] Found response:", responseVar);
          onResponseChange({
            identifier: responseVar.identifier || 'RESPONSE',
            value: responseVar.value
          });
        } else {
          // Fallback: try to find any variable with a value
          const anyVarWithValue = variables.find((v: { value?: unknown }) => v.value != null);
          if (anyVarWithValue) {
            console.log("[QtiItemViewer] Found variable with value:", anyVarWithValue);
            onResponseChange({
              identifier: anyVarWithValue.identifier || 'RESPONSE',
              value: anyVarWithValue.value
            });
          }
        }
      }
    },
    [onResponseChange]
  );

  // Set up event listeners for item connection and response changes
  useEffect(() => {
    const qtiItem = qtiItemRef.current;
    const container = containerRef.current;
    if (!qtiItem) return;

    console.log("[QtiItemViewer] Setting up event listeners");

    qtiItem.addEventListener("qti-assessment-item-connected", handleItemConnected);

    // The correct event to listen for is 'qti-item-context-updated'
    // It fires on interactions and contains itemContext.variables with responses
    if (container) {
      container.addEventListener("qti-item-context-updated", handleContextUpdated);
    }
    qtiItem.addEventListener("qti-item-context-updated", handleContextUpdated);
    document.addEventListener("qti-item-context-updated", handleContextUpdated);

    return () => {
      qtiItem.removeEventListener("qti-assessment-item-connected", handleItemConnected);
      if (container) {
        container.removeEventListener("qti-item-context-updated", handleContextUpdated);
      }
      qtiItem.removeEventListener("qti-item-context-updated", handleContextUpdated);
      document.removeEventListener("qti-item-context-updated", handleContextUpdated);
    };
  }, [handleItemConnected, handleContextUpdated]);

  // Render loading state
  if (isLoading || !isQtiReady) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-muted-foreground">
            {!isQtiReady ? "Initializing QTI components..." : "Loading QTI item..."}
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading QTI item</h3>
            <p className="mt-2 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!transformedXML) {
    return (
      <div className={`flex items-center justify-center p-8 text-gray-500 ${className}`}>
        <p>No QTI content to display</p>
      </div>
    );
  }

  // Render QTI item
  return (
    <div ref={containerRef} className={`qti-item-container ${className}`}>
      <qti-item ref={qtiItemRef}>
        <item-container itemDoc={transformedXML}></item-container>
      </qti-item>
    </div>
  );
}
