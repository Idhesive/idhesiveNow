# QTI Integration Guide for IdhesiveNow

## Overview

This document describes the QTI (Question and Test Interoperability) integration in IdhesiveNow. The integration uses `@citolab/qti-components` to render QTI 3.0 assessment items from XML stored in your database.

## Architecture

### Dependencies

```json
{
  "@citolab/qti-components": "^7.17.0",
  "@citolab/qti-convert": "^0.3.37",
  "cheerio": "^1.1.2"
}
```

### Component Structure

```
components/qti/
├── qti-types.ts              # TypeScript definitions
├── qti-client-init.tsx       # Initializes QTI web components
└── qti-item-viewer.tsx       # React wrapper for QTI items

lib/qti/
└── mock-qti-data.ts          # Sample QTI XML for testing

app/(admin)/dashboard/qti-test/
└── page.tsx                  # Test page demonstrating integration
```

## Key Components

### 1. QTI Client Initialization (qti-client-init.tsx)

Initializes QTI web components globally. Must be imported in the root layout:

```tsx
import QtiClientInit from "@/components/qti/qti-client-init";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QtiClientInit />
        {children}
      </body>
    </html>
  );
}
```

### 2. QTI Item Viewer (qti-item-viewer.tsx)

Main React wrapper component for displaying QTI items:

```tsx
import QtiItemViewer from "@/components/qti/qti-item-viewer";

<QtiItemViewer
  itemXML={qtiXmlString}
  className="w-full p-4"
  onItemLoaded={() => console.log("Loaded")}
  onError={(error) => console.error(error)}
/>
```

**Features:**
- Automatic XML parsing and transformation
- Loading and error states
- Event handling for item lifecycle
- Full TypeScript support

### 3. TypeScript Support (qti-types.ts)

Extends React JSX to recognize QTI web components:

```tsx
import type { QtiItem, QtiAssessmentItem } from "@/components/qti/qti-types";

// Now you can use QTI elements with full type safety
const qtiRef = useRef<QtiItem>(null);
```

## Usage Patterns

### Basic Item Display

```tsx
"use client";

import QtiItemViewer from "@/components/qti/qti-item-viewer";
import { useState } from "react";

export default function AssessmentPage() {
  const [qtiXML, setQtiXML] = useState<string>("");

  // In a real app, fetch from database:
  // useEffect(() => {
  //   fetch('/api/qti-items/123')
  //     .then(res => res.json())
  //     .then(data => setQtiXML(data.xml));
  // }, []);

  return (
    <QtiItemViewer
      itemXML={qtiXML}
      onItemLoaded={() => console.log("Item ready")}
      onError={(error) => console.error("Failed:", error)}
    />
  );
}
```

### Advanced: Accessing QTI API

```tsx
import { useRef, useEffect } from "react";
import type { QtiItem, QtiAssessmentItem } from "@/components/qti/qti-types";

export default function InteractiveAssessment() {
  const qtiItemRef = useRef<QtiItem>(null);

  useEffect(() => {
    const qtiItem = qtiItemRef.current;
    if (!qtiItem) return;

    const handleItemConnected = (event: Event) => {
      const customEvent = event as CustomEvent<QtiAssessmentItem>;
      const assessmentItem = customEvent.detail;

      // Access QTI API methods:
      // assessmentItem.updateResponseVariable(id, value)
      // assessmentItem.showCorrectResponse(true)
      // assessmentItem.getResponseVariable(id)
    };

    qtiItem.addEventListener("qti-assessment-item-connected", handleItemConnected);

    return () => {
      qtiItem.removeEventListener("qti-assessment-item-connected", handleItemConnected);
    };
  }, []);

  return (
    <qti-item ref={qtiItemRef}>
      <item-container itemDoc={transformedXML}></item-container>
    </qti-item>
  );
}
```

## QTI XML Format

The components expect QTI 3.0 XML format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="item-001"
                      title="Sample Question"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>ChoiceA</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>Question text here?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="ChoiceA">Option A</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">Option B</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
```

## Database Integration

### Recommended Schema

```typescript
// Prisma schema example
model QtiItem {
  id          String   @id @default(cuid())
  identifier  String   @unique
  title       String
  xmlContent  String   @db.Text
  itemType    String   // "choice", "text-entry", "inline-choice", etc.
  difficulty  Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API Route Example

```typescript
// app/api/qti-items/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const item = await prisma.qtiItem.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: item.id,
    identifier: item.identifier,
    title: item.title,
    xml: item.xmlContent,
    itemType: item.itemType,
  });
}
```

### Client-Side Fetching

```tsx
"use client";

import { useEffect, useState } from "react";
import QtiItemViewer from "@/components/qti/qti-item-viewer";

export default function ItemPage({ params }: { params: { id: string } }) {
  const [qtiXML, setQtiXML] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/qti-items/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setQtiXML(data.xml);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch QTI item:", error);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <QtiItemViewer itemXML={qtiXML} className="w-full max-w-4xl mx-auto" />;
}
```

## Styling

QTI components can be styled using CSS variables:

```css
/* app/globals.css */

/* QTI Components Styling */
item-container {
  --qti-bg-active: #c6ffe3;
  --qti-border-active: #00a748;
}

test-container {
  --qti-bg-active: #c6ffe3;
  --qti-border-active: #00a748;
}

qti-item {
  @apply p-4;
}

.qti-item-container {
  @apply rounded-lg border border-border bg-card;
}
```

## Testing

A test page is available at `/dashboard/qti-test` with three sample items:

1. **Multiple Choice** - Standard choice interaction
2. **Text Entry** - Free text input
3. **Inline Choice** - Dropdown within text

Navigate to: `http://localhost:3001/dashboard/qti-test`

## Supported Interaction Types

The QTI components library supports:

- ✅ Choice Interaction (multiple choice)
- ✅ Text Entry Interaction
- ✅ Inline Choice Interaction
- ✅ Extended Text Interaction
- ✅ Order Interaction
- ✅ Match Interaction
- ✅ Associate Interaction
- ✅ Hotspot Interaction
- ✅ Hottext Interaction
- ✅ Graphic Order Interaction
- ✅ Graphic Associate Interaction
- ✅ Graphic Gap Match Interaction

See [@citolab/qti-components documentation](https://github.com/Citolab/qti-components) for details.

## Next Steps

### 1. Add Database Schema

```bash
# Update your Prisma schema
npx prisma migrate dev --name add_qti_items
```

### 2. Create API Routes

Implement CRUD operations for QTI items in your API routes.

### 3. Build Assessment Management

Create pages for:
- Creating/editing QTI items
- Organizing items into assessments
- Viewing assessment results
- Analytics dashboard

### 4. Implement Scoring

Use the QTI API to:
- Capture student responses
- Calculate scores
- Store results in database
- Generate reports

## Troubleshooting

### Issue: QTI components not rendering

**Solution:** Ensure `<QtiClientInit />` is added to root layout:

```tsx
// app/layout.tsx
import QtiClientInit from "@/components/qti/qti-client-init";
```

### Issue: TypeScript errors on QTI elements

**Solution:** Import QTI types in your component:

```tsx
import "@/components/qti/qti-types";
```

### Issue: XML parsing errors

**Solution:** Validate your QTI XML conforms to QTI 3.0 spec. Use the test page to verify.

## Resources

- [QTI 3.0 Specification](https://www.imsglobal.org/question/qtiv3p0/imsqti_v3p0.html)
- [@citolab/qti-components GitHub](https://github.com/Citolab/qti-components)
- [@citolab/qti-convert GitHub](https://github.com/Citolab/qti-convert)
- [IMS Global QTI Resources](https://www.imsglobal.org/activity/qti)

## License

This integration uses open-source components. See package licenses:
- `@citolab/qti-components` - Apache License 2.0
- `@citolab/qti-convert` - Apache License 2.0
