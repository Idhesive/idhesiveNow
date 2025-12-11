'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import type { QuizState, QuizEvent, QuizPlugin, QuestionData, ResponseData } from '@/lib/quiz/types';

interface QuizContextType {
  state: QuizState;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponse: (response: unknown) => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  loadQuestions: (questions: QuestionData[]) => void;
  addPlugin: (plugin: QuizPlugin) => void;
  removePlugin: (pluginName: string) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

type QuizAction =
  | { type: 'LOAD_QUESTIONS'; payload: QuestionData[] }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SUBMIT_RESPONSE'; payload: { questionId: string; response: unknown } }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESET_QUIZ' };

const createInitialQuizState = (): QuizState => ({
  currentQuestionIndex: 0,
  responses: [],
  isCompleted: false,
  startTime: new Date(),
  config: {
    allowReview: true,
    showFeedback: false,
  },
  questions: [],
});

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'LOAD_QUESTIONS':
      return {
        ...state,
        questions: action.payload,
        currentQuestionIndex: 0,
        responses: [],
        isCompleted: false,
        startTime: new Date(),
      };

    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return state;

    case 'PREVIOUS_QUESTION':
      if (state.currentQuestionIndex > 0 && state.config.allowReview) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return state;

    case 'SUBMIT_RESPONSE':
      const newResponse: ResponseData = {
        questionId: action.payload.questionId,
        response: action.payload.response,
        timestamp: new Date(),
      };

      const existingIndex = state.responses.findIndex(
        r => r.questionId === action.payload.questionId
      );

      let updatedResponses: ResponseData[];
      if (existingIndex >= 0) {
        updatedResponses = [...state.responses];
        updatedResponses[existingIndex] = newResponse;
      } else {
        updatedResponses = [...state.responses, newResponse];
      }

      return { ...state, responses: updatedResponses };

    case 'COMPLETE_QUIZ':
      return { ...state, isCompleted: true, endTime: new Date() };

    case 'RESET_QUIZ':
      return createInitialQuizState();

    default:
      return state;
  }
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, createInitialQuizState());
  const [plugins, setPlugins] = React.useState<QuizPlugin[]>([]);

  const emitEvent = useCallback((event: QuizEvent) => {
    plugins.forEach(plugin => {
      try {
        plugin.onEvent?.(event);
      } catch (error) {
        console.error(`Error in plugin "${plugin.name}" during event "${event.type}":`, error);
      }
    });
  }, [plugins]);

  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      const fromIndex = state.currentQuestionIndex;
      const toIndex = state.currentQuestionIndex + 1;

      dispatch({ type: 'NEXT_QUESTION' });

      emitEvent({
        type: 'navigation-next',
        timestamp: new Date(),
        fromIndex,
        toIndex,
      });

      const nextQ = state.questions[toIndex];
      if (nextQ) {
        emitEvent({
          type: 'question-started',
          timestamp: new Date(),
          questionId: nextQ.id,
          questionIndex: toIndex,
        });
      }
    }
  }, [state.currentQuestionIndex, state.questions, emitEvent]);

  const previousQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0 && state.config.allowReview) {
      const fromIndex = state.currentQuestionIndex;
      const toIndex = state.currentQuestionIndex - 1;

      dispatch({ type: 'PREVIOUS_QUESTION' });

      emitEvent({
        type: 'navigation-previous',
        timestamp: new Date(),
        fromIndex,
        toIndex,
      });

      const prevQuestion = state.questions[toIndex];
      if (prevQuestion) {
        emitEvent({
          type: 'question-started',
          timestamp: new Date(),
          questionId: prevQuestion.id,
          questionIndex: toIndex,
        });
      }
    }
  }, [state.currentQuestionIndex, state.questions, state.config.allowReview, emitEvent]);

  const submitResponse = useCallback((response: unknown) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    let questionId = currentQuestion.id;

    // Handle sub-question responses
    if (typeof response === 'object' && response !== null && 'subQuestionId' in response) {
      questionId = (response as { subQuestionId: string }).subQuestionId;
    }

    dispatch({
      type: 'SUBMIT_RESPONSE',
      payload: { questionId, response }
    });

    emitEvent({
      type: 'question-answered',
      timestamp: new Date(),
      questionId,
      response,
    });
  }, [state.currentQuestionIndex, state.questions, emitEvent]);

  const submitQuiz = useCallback(() => {
    dispatch({ type: 'COMPLETE_QUIZ' });
    emitEvent({
      type: 'quiz-completed',
      timestamp: new Date(),
      results: {
        totalQuestions: state.questions.length,
        correctAnswers: 0,
        totalPoints: 0,
        earnedPoints: 0,
        responses: state.responses,
        timeSpent: 0,
        completedAt: new Date(),
      },
    });
  }, [state.questions, state.responses, emitEvent]);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, []);

  const loadQuestions = useCallback((questions: QuestionData[]) => {
    dispatch({ type: 'LOAD_QUESTIONS', payload: questions });
    emitEvent({
      type: 'quiz-started',
      timestamp: new Date(),
      quizId: 'generated-quiz',
    });

    if (questions.length > 0) {
      emitEvent({
        type: 'question-started',
        timestamp: new Date(),
        questionId: questions[0].id,
        questionIndex: 0,
      });
    }
  }, [emitEvent]);

  const addPlugin = useCallback((plugin: QuizPlugin) => {
    setPlugins(prev => [...prev.filter(p => p.name !== plugin.name), plugin]);
  }, []);

  const removePlugin = useCallback((pluginName: string) => {
    setPlugins(prev => prev.filter(p => p.name !== pluginName));
  }, []);

  const value: QuizContextType = {
    state,
    nextQuestion,
    previousQuestion,
    submitResponse,
    submitQuiz,
    resetQuiz,
    loadQuestions,
    addPlugin,
    removePlugin,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
