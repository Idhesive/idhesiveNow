'use client';

import React, { Component, ErrorInfo, ReactNode, useEffect, useRef } from 'react';
import { useQuiz } from './QuizContext';
import QtiItemViewer from '@/components/qti/qti-item-viewer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { QTIResponseData } from '@/lib/quiz/types';

interface QuestionRendererProps {
  onResponse?: (response: QTIResponseData | null) => void;
  showFeedback?: boolean;
}

// Error Boundary Component
class QuestionRendererErrorBoundary extends Component<
  { children: ReactNode; onRetry?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('QuestionRenderer Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="question-renderer p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Question Loading Error</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'Failed to load the question component.'}
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onRetry?.();
              }}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading Question
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function QuestionRenderer({ onResponse, showFeedback = false }: QuestionRendererProps) {
  const { state, submitResponse } = useQuiz();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = state.questions[state.currentQuestionIndex];

  // Listen for QTI response events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleQtiResponse = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;

      if (detail && currentQuestion) {
        const response: QTIResponseData = {
          identifier: detail.responseIdentifier || detail.identifier || 'RESPONSE',
          value: detail.value ?? detail.response ?? null,
        };

        submitResponse(response);
        onResponse?.(response);
      }
    };

    // Listen for various QTI interaction events
    container.addEventListener('qti-interaction-response', handleQtiResponse);
    container.addEventListener('qti-outcome-changed', handleQtiResponse);

    return () => {
      container.removeEventListener('qti-interaction-response', handleQtiResponse);
      container.removeEventListener('qti-outcome-changed', handleQtiResponse);
    };
  }, [currentQuestion, submitResponse, onResponse]);

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No question available</p>
      </div>
    );
  }

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <QuestionRendererErrorBoundary onRetry={handleRetry}>
      <div className="question-renderer" ref={containerRef}>
        <QtiItemViewer
          itemXML={currentQuestion.xmlContent}
          className="w-full"
          onItemLoaded={() => console.log('Question loaded:', currentQuestion.id)}
          onError={(error) => console.error('Question error:', error)}
        />
      </div>
    </QuestionRendererErrorBoundary>
  );
}
