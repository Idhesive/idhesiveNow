"use client";

/**
 * QTI Test Page
 *
 * This page demonstrates the QTI integration with mock assessment items.
 * Use this page to test QTI rendering and functionality.
 */

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function QtiTestPage() {
  const [selectedItem, setSelectedItem] = useState<MockQtiItemType>("choice");
  const [loadCount, setLoadCount] = useState(0);

  const handleItemLoaded = () => {
    setLoadCount((prev) => prev + 1);
    toast.success("QTI item loaded successfully!");
    console.log("✅ QTI item loaded", { item: selectedItem, count: loadCount + 1 });
  };

  const handleError = (error: Error) => {
    toast.error(`Failed to load QTI item: ${error.message}`);
    console.error("❌ QTI item error:", error);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">QTI Test Page</h2>
        <p className="text-muted-foreground">
          Test QTI component integration with sample assessment items
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar - Item Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Test Items</CardTitle>
            <CardDescription>Select a QTI item to preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={selectedItem === "choice" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setSelectedItem("choice")}
            >
              Multiple Choice
            </Button>
            <Button
              variant={selectedItem === "textEntry" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setSelectedItem("textEntry")}
            >
              Text Entry
            </Button>
            <Button
              variant={selectedItem === "inlineChoice" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setSelectedItem("inlineChoice")}
            >
              Inline Choice
            </Button>

            <div className="pt-4 mt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Load Count:</p>
                <p className="text-2xl font-bold text-primary">{loadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - QTI Viewer */}
        <Card>
          <CardHeader>
            <CardTitle>QTI Item Preview</CardTitle>
            <CardDescription>
              Rendered using @citolab/qti-components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="source">XML Source</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <div className="min-h-[400px]">
                  <QtiItemViewer
                    itemXML={MOCK_QTI_ITEMS[selectedItem]}
                    className="w-full"
                    onItemLoaded={handleItemLoaded}
                    onError={handleError}
                  />
                </div>
              </TabsContent>

              <TabsContent value="source" className="mt-4">
                <div className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <pre className="text-xs">
                    <code>{MOCK_QTI_ITEMS[selectedItem]}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>QTI component integration details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Library</p>
              <p className="text-2xl font-bold">@citolab/qti-components</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Framework</p>
              <p className="text-2xl font-bold">Next.js 15</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Status</p>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
