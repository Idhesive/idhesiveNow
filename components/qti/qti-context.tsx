"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * Dark theme CSS overrides for QTI components.
 * These override the library's default light theme `:host` styles.
 */
const QTI_DARK_THEME_CSS = `
  :host {
    /* Core backgrounds - dark theme */
    --qti-bg: #1f2937 !important;
    --qti-hover-bg: #374151 !important;
    --qti-disabled-bg: #374151 !important;
    --qti-disabled-color: #9ca3af !important;

    /* Selection/Active states - dark theme with green accent */
    --qti-bg-active: #064e3b !important;
    --qti-border-active: #10b981 !important;
    --qti-light-bg-active: #065f46 !important;
    --qti-light-border-active: #34d399 !important;
    --qti-dark-bg-active: #064e3b !important;
    --qti-dark-border-active: #10b981 !important;

    /* Borders - dark theme */
    --qti-border-color: #6b7280 !important;

    /* Focus - dark theme */
    --qti-focus-color: rgba(96, 165, 250, 0.5) !important;

    /* Correct/Incorrect feedback - dark theme */
    --qti-correct: #10b981 !important;
    --qti-correct-light: #064e3b !important;
    --qti-incorrect: #f87171 !important;
    --qti-incorrect-light: #7f1d1d !important;
    --qti-partially-correct: #fbbf24 !important;
    --qti-partially-correct-light: #78350f !important;

    /* Validation - dark theme */
    --qti-validation-error-bg: #7f1d1d !important;
    --qti-validation-text: #fecaca !important;
  }
`;

/**
 * Injects dark theme CSS into an element's Shadow DOM
 */
function injectDarkThemeIntoShadowRoot(shadowRoot: ShadowRoot) {
  // Check if we already injected styles
  if (shadowRoot.querySelector("[data-qti-dark-theme]")) {
    return;
  }

  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(QTI_DARK_THEME_CSS);

  // Add to adopted stylesheets (appends to existing)
  shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, styleSheet];

  // Also add a marker style element for detection
  const marker = document.createElement("style");
  marker.setAttribute("data-qti-dark-theme", "true");
  shadowRoot.appendChild(marker);
}

/**
 * Recursively finds all shadow roots in the subtree and injects styles
 */
function injectIntoAllShadowRoots(element: Element) {
  // Check this element
  if (element.shadowRoot) {
    injectDarkThemeIntoShadowRoot(element.shadowRoot);

    // Also check children within shadow root
    element.shadowRoot.querySelectorAll("*").forEach((child) => {
      injectIntoAllShadowRoots(child);
    });
  }

  // Check all children in light DOM
  element.querySelectorAll("*").forEach((child) => {
    if (child.shadowRoot) {
      injectDarkThemeIntoShadowRoot(child.shadowRoot);
      injectIntoAllShadowRoots(child);
    }
  });
}

interface QtiContextType {
  isReady: boolean;
}

const QtiContext = createContext<QtiContextType>({ isReady: false });

export function useQtiReady() {
  return useContext(QtiContext);
}

interface QtiProviderProps {
  children: ReactNode;
}

export function QtiProvider({ children }: QtiProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let observer: MutationObserver | null = null;

    // Dynamically import QTI components to ensure client-side only
    import("@citolab/qti-components")
      .then(() => {
        console.log("✅ QTI components initialized successfully");

        // Set up MutationObserver to watch for QTI elements and inject dark theme
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof Element) {
                // Check if this is a QTI component or contains QTI components
                if (
                  node.tagName.toLowerCase().startsWith("qti-") ||
                  node.tagName.toLowerCase() === "item-container"
                ) {
                  // Wait a tick for shadow root to be created
                  requestAnimationFrame(() => {
                    injectIntoAllShadowRoots(node);
                  });
                }

                // Also check children
                const qtiElements = node.querySelectorAll(
                  "qti-item, item-container, qti-assessment-item, qti-choice-interaction, qti-simple-choice"
                );
                if (qtiElements.length > 0) {
                  requestAnimationFrame(() => {
                    qtiElements.forEach((el) => injectIntoAllShadowRoots(el));
                  });
                }
              }
            });
          });
        });

        // Start observing
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Also inject into any existing QTI elements
        requestAnimationFrame(() => {
          document
            .querySelectorAll(
              "qti-item, item-container, qti-assessment-item, qti-choice-interaction, qti-simple-choice"
            )
            .forEach((el) => injectIntoAllShadowRoots(el));
        });

        // Mark as ready
        setIsReady(true);
      })
      .catch((error) => {
        console.error("❌ Failed to initialize QTI components:", error);
      });

    return () => {
      observer?.disconnect();
    };
  }, []);

  return <QtiContext.Provider value={{ isReady }}>{children}</QtiContext.Provider>;
}
