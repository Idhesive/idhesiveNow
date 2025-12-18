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
  const handleInteractionChange = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<{ identifier: string; value: string | string[] }>;
      if (customEvent.detail && onResponseChange) {
        onResponseChange(customEvent.detail);
      }
    },
    [onResponseChange]
  );

  // Set up event listeners for item connection and response changes
  useEffect(() => {
    const qtiItem = qtiItemRef.current;
    const container = containerRef.current;
    if (!qtiItem) return;

    qtiItem.addEventListener("qti-assessment-item-connected", handleItemConnected);

    // Listen for interaction changes on the container (events bubble up)
    if (container) {
      container.addEventListener("qti-interaction-changed", handleInteractionChange);
    }

    return () => {
      qtiItem.removeEventListener("qti-assessment-item-connected", handleItemConnected);
      if (container) {
        container.removeEventListener("qti-interaction-changed", handleInteractionChange);
      }
    };
  }, [handleItemConnected, handleInteractionChange, transformedXML]);

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
