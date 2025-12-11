export interface QuizConfig {
  allowReview: boolean;
  showFeedback: boolean;
  timeLimit?: number; // in seconds
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  allowSkipping?: boolean;
}

export interface QuestionData {
  id: string;
  type: 'choice' | 'textEntry' | 'gapMatch' | 'associate' | 'extendedText' | 'parent';
  title: string;
  xmlContent: string;
  maxAttempts?: number;
  timeLimit?: number; // in seconds
  points?: number;
  correctResponse?: unknown;
}

export interface ResponseData {
  questionId: string;
  response: unknown;
  timestamp: Date;
  isCorrect?: boolean;
  points?: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  responses: ResponseData[];
  isCompleted: boolean;
  startTime: Date;
  endTime?: Date;
  config: QuizConfig;
  questions: QuestionData[];
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  earnedPoints: number;
  responses: ResponseData[];
  timeSpent: number; // in seconds
  completedAt: Date;
}

export type QuizEvent =
  | { type: 'quiz-started'; timestamp: Date; quizId: string }
  | { type: 'question-started'; timestamp: Date; questionId: string; questionIndex: number }
  | { type: 'question-answered'; timestamp: Date; questionId: string; response: unknown }
  | { type: 'navigation-next'; timestamp: Date; fromIndex: number; toIndex: number }
  | { type: 'navigation-previous'; timestamp: Date; fromIndex: number; toIndex: number }
  | { type: 'quiz-completed'; timestamp: Date; results: QuizResults };

export interface QuizPlugin {
  name: string;
  onEvent?(event: QuizEvent): void;
}

// QTI Response types
export interface QTIResponseData {
  identifier: string;
  value: string | string[] | null;
  subQuestionId?: string;
}
