'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  Zap,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  TrendingUp,
} from 'lucide-react';
import { QuestionRenderer } from '../QuestionRenderer';
import { QuizProvider, useQuiz } from '../QuizContext';
import type { QuestionData } from '@/lib/quiz/types';

export interface StreamModeProps {
  title: string;
  description?: string;
  questions: QuestionData[];
  timeLimit: number; // Total session time in seconds
  questionTimeLimit?: number; // Per-question time limit (optional)
  fetchNextQuestion?: () => Promise<QuestionData | null>; // Fetch next question from server
  onAnswerSubmit?: (response: StreamAnswerResult) => void;
  onSessionComplete?: (results: StreamResults) => void;
  showStreak?: boolean;
  showScore?: boolean;
}

export interface StreamAnswerResult {
  questionId: string;
  response: unknown;
  timeSpent: number;
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface StreamResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  totalScore: number;
  averageTimePerQuestion: number;
  longestStreak: number;
  timeSpent: number;
  completedAt: Date;
  responses: StreamAnswerResult[];
}

type SessionState = 'ready' | 'playing' | 'paused' | 'completed';

function StreamContent({
  title,
  description,
  questions: initialQuestions,
  timeLimit,
  questionTimeLimit,
  fetchNextQuestion,
  onAnswerSubmit,
  onSessionComplete,
  showStreak = true,
  showScore = true,
}: StreamModeProps) {
  const { state, loadQuestions, submitResponse } = useQuiz();

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('ready');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number | null>(
    questionTimeLimit ?? null
  );

  // Stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [answers, setAnswers] = useState<StreamAnswerResult[]>([]);

  // Question timing
  const questionStartTime = useRef<Date>(new Date());
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [questionQueue, setQuestionQueue] = useState<QuestionData[]>(initialQuestions);

  // Session timer
  useEffect(() => {
    if (sessionState !== 'playing' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState, timeRemaining]);

  // Question timer
  useEffect(() => {
    if (
      sessionState !== 'playing' ||
      questionTimeRemaining === null ||
      questionTimeRemaining <= 0
    )
      return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSkip();
          return questionTimeLimit ?? null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState, questionTimeRemaining, questionTimeLimit]);

  const handleSessionEnd = useCallback(() => {
    setSessionState('completed');

    const results: StreamResults = {
      totalQuestions: answers.length + (state.questions.length > 0 ? 1 : 0),
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      skippedQuestions: skippedCount,
      totalScore,
      averageTimePerQuestion: answers.length > 0
        ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length
        : 0,
      longestStreak,
      timeSpent: timeLimit - timeRemaining,
      completedAt: new Date(),
      responses: answers,
    };

    onSessionComplete?.(results);
  }, [answers, correctCount, incorrectCount, skippedCount, totalScore, longestStreak, timeLimit, timeRemaining, onSessionComplete, state.questions.length]);

  const handleStart = useCallback(() => {
    setSessionState('playing');
    questionStartTime.current = new Date();
    if (questionQueue.length > 0) {
      loadQuestions([questionQueue[0]]);
    }
  }, [loadQuestions, questionQueue]);

  const handlePause = useCallback(() => {
    setSessionState('paused');
  }, []);

  const handleResume = useCallback(() => {
    setSessionState('playing');
    questionStartTime.current = new Date();
  }, []);

  const loadNextQuestion = useCallback(async () => {
    setIsLoadingNext(true);

    try {
      if (fetchNextQuestion) {
        const newQuestion = await fetchNextQuestion();
        if (newQuestion) {
          loadQuestions([newQuestion]);
          questionStartTime.current = new Date();
          setQuestionTimeRemaining(questionTimeLimit ?? null);
          setIsLoadingNext(false);
          return true;
        }
      }

      const nextIndex = answers.length + 1;
      if (nextIndex < questionQueue.length) {
        loadQuestions([questionQueue[nextIndex]]);
        questionStartTime.current = new Date();
        setQuestionTimeRemaining(questionTimeLimit ?? null);
        setIsLoadingNext(false);
        return true;
      }

      setIsLoadingNext(false);
      handleSessionEnd();
      return false;
    } catch (error) {
      console.error('Error loading next question:', error);
      setIsLoadingNext(false);
      return false;
    }
  }, [fetchNextQuestion, answers.length, questionQueue, loadQuestions, questionTimeLimit, handleSessionEnd]);

  const processAnswer = useCallback(
    (isCorrect: boolean, isSkipped: boolean = false) => {
      const currentQuestion = state.questions[0];
      if (!currentQuestion) return;

      const timeSpent = Math.floor(
        (new Date().getTime() - questionStartTime.current.getTime()) / 1000
      );

      let pointsEarned = 0;
      if (isCorrect && !isSkipped) {
        const basePoints = currentQuestion.points ?? 10;
        const speedBonus = questionTimeLimit
          ? Math.floor(((questionTimeRemaining ?? 0) / questionTimeLimit) * 5)
          : 0;
        const streakBonus = Math.min(currentStreak * 2, 10);
        pointsEarned = basePoints + speedBonus + streakBonus;
      }

      const answerResult: StreamAnswerResult = {
        questionId: currentQuestion.id,
        response: state.responses[0]?.response ?? null,
        timeSpent,
        isCorrect: isSkipped ? false : isCorrect,
        pointsEarned,
      };

      setAnswers((prev) => [...prev, answerResult]);
      onAnswerSubmit?.(answerResult);

      if (isSkipped) {
        setSkippedCount((prev) => prev + 1);
        setCurrentStreak(0);
      } else if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        setTotalScore((prev) => prev + pointsEarned);
        setCurrentStreak((prev) => {
          const newStreak = prev + 1;
          if (newStreak > longestStreak) {
            setLongestStreak(newStreak);
          }
          return newStreak;
        });
      } else {
        setIncorrectCount((prev) => prev + 1);
        setCurrentStreak(0);
      }

      loadNextQuestion();
    },
    [state.questions, state.responses, questionTimeLimit, questionTimeRemaining, currentStreak, longestStreak, onAnswerSubmit, loadNextQuestion]
  );

  const handleSubmitAnswer = useCallback(() => {
    processAnswer(true, false);
  }, [processAnswer]);

  const handleSkip = useCallback(() => {
    processAnswer(false, true);
  }, [processAnswer]);

  const handleRetry = useCallback(() => {
    setSessionState('ready');
    setTimeRemaining(timeLimit);
    setQuestionTimeRemaining(questionTimeLimit ?? null);
    setCurrentStreak(0);
    setLongestStreak(0);
    setTotalScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSkippedCount(0);
    setAnswers([]);
  }, [timeLimit, questionTimeLimit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ready state
  if (sessionState === 'ready') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-6 h-6 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatTime(timeLimit)}</div>
                <div className="text-sm text-blue-600 dark:text-blue-500">Time Limit</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Target className="w-6 h-6 mx-auto text-green-600 dark:text-green-400 mb-2" />
                <div className="text-lg font-bold text-green-700 dark:text-green-400">{questionQueue.length}</div>
                <div className="text-sm text-green-600 dark:text-green-500">Questions Available</div>
              </div>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Answer as many questions as you can within the time limit. Build streaks for bonus
                points! Questions are submitted one at a time.
              </AlertDescription>
            </Alert>

            <Button size="lg" className="w-full" onClick={handleStart}>
              <Play className="w-5 h-5 mr-2" />
              Start Stream
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed state
  if (sessionState === 'completed') {
    const accuracy = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl text-yellow-700 dark:text-yellow-400">Session Complete!</CardTitle>
            <CardDescription>{title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-4xl font-bold text-yellow-700 dark:text-yellow-400">{totalScore} pts</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                <div className="text-xl font-bold text-green-700 dark:text-green-400">{correctCount}</div>
                <div className="text-xs text-green-600 dark:text-green-500">Correct</div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-5 h-5 mx-auto text-red-600 dark:text-red-400 mb-1" />
                <div className="text-xl font-bold text-red-700 dark:text-red-400">{incorrectCount + skippedCount}</div>
                <div className="text-xs text-red-600 dark:text-red-500">Incorrect/Skipped</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Target className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{Math.round(accuracy)}%</div>
                <div className="text-xs text-blue-600 dark:text-blue-500">Accuracy</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                <div className="text-xl font-bold text-purple-700 dark:text-purple-400">{longestStreak}</div>
                <div className="text-xs text-purple-600 dark:text-purple-500">Best Streak</div>
              </div>
            </div>

            <Button onClick={handleRetry} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing / Paused state
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
        <div className="flex items-center gap-4">
          <Badge
            variant={timeRemaining < 30 ? 'destructive' : 'secondary'}
            className={`text-lg px-4 py-2 ${timeRemaining < 30 ? 'animate-pulse' : ''}`}
          >
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(timeRemaining)}
          </Badge>

          {questionTimeRemaining !== null && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Timer className="w-4 h-4 mr-2" />
              {questionTimeRemaining}s
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showScore && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{totalScore}</div>
              <div className="text-xs text-purple-600 dark:text-purple-500">Score</div>
            </div>
          )}

          {showStreak && currentStreak > 0 && (
            <Badge variant="default" className="bg-orange-500 text-lg px-4 py-2">
              <Zap className="w-4 h-4 mr-1" />
              {currentStreak} streak!
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={sessionState === 'paused' ? handleResume : handlePause}
          >
            {sessionState === 'paused' ? (
              <>
                <Play className="w-4 h-4 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Questions answered: {answers.length}</span>
        <div className="flex-1">
          <Progress value={(1 - timeRemaining / timeLimit) * 100} className="h-1" />
        </div>
        <span>
          {correctCount} correct, {incorrectCount + skippedCount} wrong
        </span>
      </div>

      {/* Paused overlay */}
      {sessionState === 'paused' && (
        <Alert className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800">
          <Pause className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Session paused. Timer stopped.</span>
            <Button size="sm" onClick={handleResume}>
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Question Card */}
      <Card className={sessionState === 'paused' ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Question {answers.length + 1}</CardTitle>
            {state.questions[0] && (
              <Badge variant="outline">{state.questions[0].points ?? 10} pts</Badge>
            )}
          </div>
          {state.questions[0] && (
            <CardDescription>{state.questions[0].title}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="min-h-[250px]">
          {isLoadingNext ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading next question...</span>
            </div>
          ) : state.questions.length > 0 ? (
            <QuestionRenderer />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">No more questions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={handleSkip} disabled={sessionState === 'paused'}>
          Skip
        </Button>

        <Button
          size="lg"
          onClick={handleSubmitAnswer}
          disabled={sessionState === 'paused' || isLoadingNext}
        >
          Submit & Next
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>

      {/* Keyboard hint */}
      <div className="text-center text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to submit,{' '}
        <kbd className="px-1 py-0.5 bg-muted rounded">S</kbd> to skip
      </div>
    </div>
  );
}

export function StreamMode(props: StreamModeProps) {
  return (
    <QuizProvider>
      <StreamContent {...props} />
    </QuizProvider>
  );
}

export default StreamMode;
