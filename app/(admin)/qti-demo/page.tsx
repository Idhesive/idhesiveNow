"use client";

/**
 * QTI Components Demo Page
 *
 * This page demonstrates how to use the QTI components in your application.
 * It shows practical examples of integrating QTI assessment items.
 */

import { useState, useCallback } from "react";
import QtiItemViewer from "@/components/qti/qti-item-viewer";
import { MOCK_QTI_ITEMS, type MockQtiItemType } from "@/lib/qti/mock-qti-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Code2, BookOpen, Lightbulb } from "lucide-react";

export default function QtiDemoPage() {
  const [selectedItem, setSelectedItem] = useState<MockQtiItemType>("choice");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use useCallback to prevent function recreation on each render
  const handleItemLoaded = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    // Only show toast on initial load, not re-renders
  }, []);

  const handleError = useCallback((error: Error) => {
    setIsLoading(false);
    setHasError(true);
    toast.error(`❌ Error: ${error.message}`);
  }, []);

  const itemMetadata = {
    choice: {
      title: "Multiple Choice Question",
      description: "Standard QTI choice interaction with single selection",
      difficulty: "Easy",
      points: 1,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-800",
    },
    textEntry: {
      title: "Text Entry Question",
      description: "Free-form text input interaction",
      difficulty: "Medium",
      points: 2,
      icon: Code2,
      color: "bg-blue-100 text-blue-800",
    },
    inlineChoice: {
      title: "Inline Choice Question",
      description: "Dropdown selection within text (fill-in-the-blank)",
      difficulty: "Easy",
      points: 1,
      icon: BookOpen,
      color: "bg-purple-100 text-purple-800",
    },
  };

  const currentItem = itemMetadata[selectedItem];
  const ItemIcon = currentItem.icon;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">QTI Components Demo</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Interactive demonstration of QTI (Question and Test Interoperability) components
          integrated into Next.js 15. Select different question types to see how they render.
        </p>
      </div>

      {/* Status Bar */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Library Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="font-semibold">Active</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Item</p>
              <p className="font-semibold capitalize">{selectedItem.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <Badge variant="outline" className={currentItem.color}>
                {currentItem.difficulty}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="font-semibold">{currentItem.points} pt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Sidebar - Question Type Selector */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Types</CardTitle>
              <CardDescription>
                Select a QTI interaction type to preview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(Object.keys(itemMetadata) as MockQtiItemType[]).map((itemType) => {
                const meta = itemMetadata[itemType];
                const Icon = meta.icon;
                const isSelected = selectedItem === itemType;

                return (
                  <button
                    key={itemType}
                    onClick={() => {
                      setSelectedItem(itemType);
                      setIsLoading(true);
                      setHasError(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1 space-y-1">
                        <p className={`font-medium ${isSelected ? "text-primary" : ""}`}>
                          {meta.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {meta.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {meta.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {meta.points} pt
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p>QTI XML is stored in your database</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p>XML is parsed and transformed client-side</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p>QTI web components render the interactive item</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <p>Student responses are captured via events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - QTI Viewer */}
        <div className="space-y-4">
          {/* Item Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ItemIcon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>{currentItem.title}</CardTitle>
                    <CardDescription>{currentItem.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {!isLoading && !hasError && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {hasError && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* QTI Item Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Preview</CardTitle>
              <CardDescription>
                This is how the question will appear to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] rounded-lg border-2 border-dashed border-border p-6 bg-muted/30">
                <QtiItemViewer
                  itemXML={MOCK_QTI_ITEMS[selectedItem]}
                  className="w-full"
                  onItemLoaded={handleItemLoaded}
                  onError={handleError}
                />
              </div>
            </CardContent>
          </Card>

          {/* Code Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage Example</CardTitle>
              <CardDescription>
                How to use this component in your code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-slate-950 p-4 overflow-x-auto">
                <pre className="text-xs text-slate-50">
                  <code>{`import QtiItemViewer from "@/components/qti/qti-item-viewer";

export default function AssessmentPage() {
  const [qtiXML, setQtiXML] = useState("");

  // Fetch from your database
  useEffect(() => {
    fetch('/api/qti-items/123')
      .then(res => res.json())
      .then(data => setQtiXML(data.xml));
  }, []);

  return (
    <QtiItemViewer
      itemXML={qtiXML}
      onItemLoaded={() => console.log("Ready")}
      onError={(err) => console.error(err)}
    />
  );
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Features</CardTitle>
          <CardDescription>
            What you get with this QTI integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">QTI 3.0 Support</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Full support for QTI 3.0 specification with all interaction types
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">TypeScript Support</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Fully typed components with IntelliSense support
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Error Handling</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Built-in loading states and error boundaries
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Event System</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Capture student responses and item lifecycle events
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Automatic Parsing</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                XML transformation and validation handled automatically
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Responsive Design</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Works seamlessly on desktop, tablet, and mobile devices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Ready to integrate QTI into your application?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Set up your database schema</h4>
            <p className="text-sm text-muted-foreground">
              Add a table to store QTI XML content with metadata (title, difficulty, type, etc.)
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Create API routes</h4>
            <p className="text-sm text-muted-foreground">
              Build endpoints to fetch QTI items from your database
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. Use QtiItemViewer component</h4>
            <p className="text-sm text-muted-foreground">
              Import and use the component in your pages to display QTI items
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">4. Implement response tracking</h4>
            <p className="text-sm text-muted-foreground">
              Listen to QTI events to capture student responses and save them to your database
            </p>
          </div>
          <div className="pt-4">
            <Button asChild>
              <a href="/QTI_INTEGRATION.md" target="_blank">
                View Full Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
