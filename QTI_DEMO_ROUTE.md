# QTI Demo Route

## Overview

A comprehensive demonstration route has been created at `/qti-demo` to showcase the QTI components integration in IdhesiveNow.

## Access

**URL:** http://localhost:3001/qti-demo

**Navigation:** Click "QTI Demo" in the sidebar (dashboard must be accessed first)

## Features

### 1. Interactive Question Type Selector

The demo page includes a sidebar with three QTI question types:

- **Multiple Choice** - Standard choice interaction (single selection)
- **Text Entry** - Free-form text input interaction
- **Inline Choice** - Dropdown selection within text (fill-in-the-blank)

Each type shows:
- Description
- Difficulty level badge
- Point value
- Visual icon

### 2. Live QTI Item Preview

Shows how the QTI component renders in real-time:
- Loading states with spinner
- Error handling with visual feedback
- Interactive question display
- Automatic XML parsing
- Toast notifications on load/error

### 3. Code Example

Displays the exact code needed to use the QTI component:

```tsx
import QtiItemViewer from "@/components/qti/qti-item-viewer";

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
}
```

### 4. Status Indicators

Real-time status display showing:
- Library Status: Active/Inactive with pulsing indicator
- Current Item: Which question type is displayed
- Difficulty: Badge showing question difficulty
- Points: Point value for the question

### 5. How It Works Section

Step-by-step explanation of the QTI integration flow:
1. QTI XML stored in database
2. XML parsed and transformed client-side
3. QTI web components render interactive item
4. Student responses captured via events

### 6. Integration Features Grid

Highlights key capabilities:
- ✅ QTI 3.0 Support
- ✅ TypeScript Support
- ✅ Error Handling
- ✅ Event System
- ✅ Automatic Parsing
- ✅ Responsive Design

### 7. Next Steps Guide

Provides clear instructions for developers:
1. Set up database schema
2. Create API routes
3. Use QtiItemViewer component
4. Implement response tracking

## Page Structure

```
/qti-demo/
└── page.tsx                 # Main demo page component
```

## Components Used

- `QtiItemViewer` - Core QTI rendering component
- `Card`, `CardHeader`, `CardContent` - Layout components
- `Button` - Action buttons
- `Badge` - Status badges
- `toast` - Notification system
- `lucide-react` icons - Visual indicators

## What to Test

1. **Question Switching**
   - Click each question type button
   - Observe smooth transitions
   - Check loading states

2. **QTI Rendering**
   - Verify questions render correctly
   - Test interactions (selecting answers, typing text)
   - Check responsive behavior

3. **Visual Feedback**
   - Loading spinner when switching items
   - Success toast on successful load
   - Error handling (if XML is invalid)

4. **Navigation**
   - Sidebar link highlights when active
   - Breadcrumb trail (if implemented)
   - Back to dashboard

## Differences from Test Page

The QTI demo route (`/qti-demo`) differs from the test page (`/dashboard/qti-test`):

| Feature | Demo Route | Test Page |
|---------|-----------|-----------|
| **Purpose** | Public showcase | Development testing |
| **Layout** | Full-featured demo | Simple preview |
| **Documentation** | Extensive inline docs | Basic usage |
| **Code Examples** | Included | Not included |
| **Features Grid** | Yes | No |
| **Next Steps** | Comprehensive guide | Basic info |
| **Navigation** | Sidebar link | Manual URL |

## Use Cases

### For Developers
- Understand how to integrate QTI components
- Copy code examples for their own implementations
- Test different QTI interaction types
- Debug QTI rendering issues

### For Stakeholders
- See QTI capabilities in action
- Understand supported question types
- Evaluate feature completeness
- Make decisions on QTI adoption

### For QA/Testing
- Test all QTI interaction types
- Verify responsive behavior
- Check error handling
- Validate loading states

## Browser Console

When using the demo, check the browser console for:
- `✅ QTI components initialized successfully`
- `✅ QTI item loaded` (with metadata)
- `QTI Assessment Item connected` (when item loads)

## Next Development Steps

1. **Add More Question Types**
   - Extended text interaction
   - Match interaction
   - Order interaction
   - Hotspot interaction

2. **Response Tracking**
   - Capture student responses
   - Send to database
   - Show response history

3. **Scoring Display**
   - Show correct/incorrect feedback
   - Display score
   - Explain correct answers

4. **Assessment Mode**
   - Multiple questions in sequence
   - Progress tracking
   - Timer functionality

## Technical Notes

- Route uses Next.js 15 App Router
- Client-side rendering only (`"use client"`)
- QTI components loaded dynamically
- TypeScript with full type safety
- Responsive design with Tailwind CSS
- Accessible UI components from shadcn/ui

## Troubleshooting

### Demo page not loading
- Check server is running on port 3001
- Verify you're logged in (auth required for dashboard routes)
- Check browser console for errors

### QTI items not rendering
- Verify `<QtiClientInit />` in root layout
- Check browser console for QTI initialization message
- Confirm mock data is loading correctly

### Navigation link not showing
- Clear browser cache
- Restart dev server
- Check sidebar component has latest changes

## Related Files

- `/components/qti/qti-item-viewer.tsx` - Main QTI component
- `/lib/qti/mock-qti-data.ts` - Sample QTI XML
- `/components/app-sidebar.tsx` - Navigation with QTI Demo link
- `/QTI_INTEGRATION.md` - Full integration documentation

## Resources

Access the demo at: **http://localhost:3001/qti-demo**

Full documentation: `/QTI_INTEGRATION.md`

Test page: http://localhost:3001/dashboard/qti-test
