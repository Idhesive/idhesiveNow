/**
 * TypeScript type definitions for QTI components integration
 * Extends React JSX to support @citolab/qti-components web components
 */

import { CustomElements } from "@citolab/qti-components/react";
import type { QtiAssessmentItem, QtiItem } from "@citolab/qti-components";

// Extend React JSX to recognize QTI web components
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends CustomElements {}
  }
}

// Export commonly used QTI types
export type { QtiAssessmentItem, QtiItem };

// QTI Item Viewer Props
export interface QtiItemViewerProps {
  /**
   * QTI XML content as string
   */
  itemXML: string;

  /**
   * Optional CSS class name for styling
   */
  className?: string;

  /**
   * Optional callback when item is loaded
   */
  onItemLoaded?: () => void;

  /**
   * Optional callback when item encounters an error
   */
  onError?: (error: Error) => void;
}

// QTI Item Event Types
export interface QtiItemConnectedEvent extends CustomEvent {
  detail: QtiAssessmentItem;
}

export interface QtiResponseChangeEvent extends CustomEvent {
  detail: {
    identifier: string;
    value: string | string[];
  };
}
