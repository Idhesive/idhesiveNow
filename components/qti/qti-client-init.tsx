"use client";

/**
 * QTI Client Initialization Component
 *
 * This component wraps children with the QtiProvider to ensure
 * QTI web components are initialized before any QTI content renders.
 *
 * Usage:
 *   import QtiClientInit from "@/components/qti/qti-client-init";
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <QtiClientInit>
 *             {children}
 *           </QtiClientInit>
 *         </body>
 *       </html>
 *     );
 *   }
 */

import { QtiProvider } from "./qti-context";

interface QtiClientInitProps {
  children: React.ReactNode;
}

export default function QtiClientInit({ children }: QtiClientInitProps) {
  return <QtiProvider>{children}</QtiProvider>;
}

// Re-export the hook for convenience
export { useQtiReady } from "./qti-context";
