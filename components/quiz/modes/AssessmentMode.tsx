'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Trophy,
  RotateCcw,
  Send,
  Flag,
} from 'lucide-react';
import { QuestionRenderer } from '../QuestionRenderer';
import { QuizProvider, useQuiz } from '../QuizContext';
import type { QuestionData } from '@/lib/quiz/types';

export interface AssessmentModeProps {
  title: string;
  description?: string;
  questions: QuestionData[];
  timeLimit?: number; // Total time limit in seconds
  allowReview?: boolean; // Can navigate back to previous questions
  showQuestionList?: boolean; // Show question overview panel
  onComplete?: (results: AssessmentResults) => void;
  onQuestionChange?: (questionIndex: number) => void;
}

export interface AssessmentResults {
  totalQuestions: number;
  answeredQuestions: number;
  responses: Array<{ questionId: string; response: unknown; timestamp: Date }>;
  timeSpent: number;
  completedAt: Date;
  flaggedQuestions: string[];
}

function AssessmentContent({
  title,
  description,
  questions,
  timeLimit,
  allowReview = true,
  showQuestionList = true,
  onComplete,
  onQuestionChange,
}: AssessmentModeProps) {
  const { state, loadQuestions, nextQuestion, previousQuestion, submitQuiz, resetQuiz } = useQuiz();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit ?? null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Initialize questions
  useEffect(() => {
    loadQuestions(questions);
  }, [questions, loadQuestions]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || state.isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, state.isCompleted]);

  // Notify parent of question changes
  useEffect(() => {
    onQuestionChange?.(state.currentQuestionIndex);
  }, [state.currentQuestionIndex, onQuestionChange]);

  // Handle quiz completion
  useEffect(() => {
    if (state.isCompleted && !showResults) {
      setShowResults(true);
      const timeSpent = timeLimit
        ? timeLimit - (timeRemaining ?? 0)
        : Math.floor((Date.now() - state.startTime.getTime()) / 1000);

      onComplete?.({
        totalQuestions: questions.length,
        answeredQuestions: state.responses.length,
        responses: state.responses,
        timeSpent,
        completedAt: new Date(),
        flaggedQuestions: Array.from(flaggedQuestions),
      });
    }
  }, [state.isCompleted, showResults, questions.length, state.responses, timeLimit, timeRemaining, flaggedQuestions, onComplete, state.startTime]);

  const handleSubmit = useCallback(() => {
    submitQuiz();
    setShowSubmitDialog(false);
  }, [submitQuiz]);

  const handleRetry = useCallback(() => {
    resetQuiz();
    setShowResults(false);
    setTimeRemaining(timeLimit ?? null);
    setFlaggedQuestions(new Set());
    loadQuestions(questions);
  }, [resetQuiz, timeLimit, loadQuestions, questions]);

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    if (!allowReview && index < state.currentQuestionIndex) return;

    const diff = index - state.currentQuestionIndex;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        nextQuestion();
      }
    } else if (diff < 0 && allowReview) {
      for (let i = 0; i < Math.abs(diff); i++) {
        previousQuestion();
      }
    }
  }, [state.currentQuestionIndex, allowReview, nextQuestion, previousQuestion]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCurrentAnswered = currentQuestion
    ? state.responses.some((r) => r.questionId === currentQuestion.id)
    : false;
  const isCurrentFlagged = currentQuestion ? flaggedQuestions.has(currentQuestion.id) : false;
  const answeredCount = state.responses.length;
  const progressPercentage = state.questions.length > 0
    ? ((state.currentQuestionIndex + 1) / state.questions.length) * 100
    : 0;

  const unansweredQuestions = useMemo(() => {
    return state.questions.filter((q) => !state.responses.some((r) => r.questionId === q.id));
  }, [state.questions, state.responses]);

  if (showResults) {
    const timeSpent = timeLimit
      ? timeLimit - (timeRemaining ?? 0)
      : Math.floor((Date.now() - state.startTime.getTime()) / 1000);

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">Assessment Completed!</CardTitle>
            <CardDescription>{title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {answeredCount}/{state.questions.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-500">Answered</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {Math.round((answeredCount / state.questions.length) * 100)}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-500">Completion</div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{flaggedQuestions.size}</div>
                <div className="text-sm text-amber-600 dark:text-amber-500">Flagged</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{formatTime(timeSpent)}</div>
                <div className="text-sm text-purple-600 dark:text-purple-500">Time Spent</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-4">
          {timeRemaining !== null && (
            <Badge
              variant={timeRemaining < 60 ? 'destructive' : 'secondary'}
              className={`text-lg px-4 py-2 ${timeRemaining < 60 ? 'animate-pulse' : ''}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {state.currentQuestionIndex + 1} of {state.questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question List Sidebar */}
        {showQuestionList && (
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-1">
                {state.questions.map((q, index) => {
                  const isAnswered = state.responses.some((r) => r.questionId === q.id);
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isCurrent = index === state.currentQuestionIndex;

                  return (
                    <Button
                      key={q.id}
                      variant={isCurrent ? 'default' : 'outline'}
                      size="sm"
                      className={`relative h-10 w-10 p-0 ${
                        isAnswered && !isCurrent ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700' : ''
                      } ${isFlagged ? 'ring-2 ring-amber-400' : ''}`}
                      onClick={() => goToQuestion(index)}
                      disabled={!allowReview && index < state.currentQuestionIndex}
                    >
                      {isAnswered ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 fill-amber-500" />
                      )}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span>Flagged for review</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Question Area */}
        <Card className={showQuestionList ? 'lg:col-span-3' : 'col-span-full'}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Question {state.currentQuestionIndex + 1}
              </CardTitle>
              {currentQuestion && (
                <CardDescription>{currentQuestion.title}</CardDescription>
              )}
            </div>
            {currentQuestion && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={isCurrentFlagged ? 'text-amber-500' : ''}
              >
                <Flag className={`h-4 w-4 ${isCurrentFlagged ? 'fill-amber-500' : ''}`} />
                {isCurrentFlagged ? 'Flagged' : 'Flag'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {state.questions.length > 0 ? (
              <QuestionRenderer />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading questions...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={state.currentQuestionIndex === 0 || !allowReview}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {state.currentQuestionIndex === state.questions.length - 1 ? (
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="default">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assessment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div>
                      {unansweredQuestions.length > 0 ? (
                        <Alert className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            You have {unansweredQuestions.length} unanswered question(s). Are you
                            sure you want to submit?
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <span>You have answered all questions. Are you ready to submit your assessment?</span>
                      )}
                      {flaggedQuestions.size > 0 && (
                        <p className="mt-2 text-amber-600 dark:text-amber-400">
                          You have {flaggedQuestions.size} flagged question(s) for review.
                        </p>
                      )}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Submit Assessment</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={nextQuestion}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="text-center text-xs text-muted-foreground">
        Use <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to continue,{' '}
        <kbd className="px-1 py-0.5 bg-muted rounded">Arrow keys</kbd> to navigate
      </div>
    </div>
  );
}

export function AssessmentMode(props: AssessmentModeProps) {
  return (
    <QuizProvider>
      <AssessmentContent {...props} />
    </QuizProvider>
  );
}

export default AssessmentMode;
