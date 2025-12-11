'use client';

import { useState, useCallback, useRef } from 'react';
import type { QuestionData } from '@/lib/quiz/types';

export interface QuestionFetcherOptions {
  batchSize?: number;
  prefetchThreshold?: number;
  endpoint?: string;
  topicId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuestionFetcherState {
  questions: QuestionData[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  totalFetched: number;
}

export interface QuestionFetcherReturn extends QuestionFetcherState {
  fetchBatch: () => Promise<QuestionData[]>;
  fetchSingle: () => Promise<QuestionData | null>;
  reset: () => void;
  getNextQuestion: () => QuestionData | null;
  peekNextQuestions: (count: number) => QuestionData[];
}

// Mock question generator for demo purposes (QTI 3.0 format)
function generateMockQuestion(index: number): QuestionData {
  const types: Array<'choice' | 'textEntry'> = ['choice', 'textEntry'];
  const type = types[index % types.length];

  if (type === 'choice') {
    const questions = [
      { title: 'What is 5 + 7?', answer: 'B', options: ['10', '12', '14', '11'] },
      { title: 'What is the capital of Japan?', answer: 'A', options: ['Tokyo', 'Seoul', 'Beijing', 'Bangkok'] },
      { title: 'Which planet is closest to the Sun?', answer: 'A', options: ['Mercury', 'Venus', 'Earth', 'Mars'] },
      { title: 'What is 8 x 9?', answer: 'C', options: ['63', '64', '72', '81'] },
      { title: 'H2O is the chemical formula for?', answer: 'B', options: ['Oxygen', 'Water', 'Hydrogen', 'Salt'] },
    ];
    const q = questions[index % questions.length];

    return {
      id: `q-${index}-${Date.now()}`,
      type: 'choice',
      title: q.title,
      points: 10,
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="q${index}"
                      title="${q.title}"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>${q.answer}</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>${q.title}</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">${q.options[0]}</qti-simple-choice>
      <qti-simple-choice identifier="B">${q.options[1]}</qti-simple-choice>
      <qti-simple-choice identifier="C">${q.options[2]}</qti-simple-choice>
      <qti-simple-choice identifier="D">${q.options[3]}</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
    };
  } else {
    const questions = [
      { title: 'What is the largest ocean?', answer: 'Pacific' },
      { title: 'What is 100 / 4?', answer: '25' },
      { title: 'Name the smallest prime number', answer: '2' },
      { title: 'What gas do plants absorb?', answer: 'Carbon dioxide' },
      { title: 'How many sides does a hexagon have?', answer: '6' },
    ];
    const q = questions[index % questions.length];

    return {
      id: `q-${index}-${Date.now()}`,
      type: 'textEntry',
      title: q.title,
      points: 15,
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="q${index}"
                      title="${q.title}"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-correct-response>
      <qti-value>${q.answer}</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>${q.title}</p>
    <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="30"/>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
    };
  }
}

export function useQuestionFetcher(options: QuestionFetcherOptions = {}): QuestionFetcherReturn {
  const {
    batchSize = 5,
    prefetchThreshold = 2,
    endpoint,
    topicId,
    difficulty,
  } = options;

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalFetched, setTotalFetched] = useState(0);

  const currentIndex = useRef(0);
  const fetchCount = useRef(0);

  const fetchBatch = useCallback(async (): Promise<QuestionData[]> => {
    if (!hasMore) return [];

    setIsLoading(true);
    setError(null);

    try {
      if (endpoint) {
        const params = new URLSearchParams({
          limit: batchSize.toString(),
          offset: totalFetched.toString(),
        });

        if (topicId) params.append('topicId', topicId);
        if (difficulty) params.append('difficulty', difficulty);

        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }

        const data = await response.json();
        const newQuestions: QuestionData[] = data.questions || data;

        if (newQuestions.length < batchSize) {
          setHasMore(false);
        }

        setQuestions((prev) => [...prev, ...newQuestions]);
        setTotalFetched((prev) => prev + newQuestions.length);
        setIsLoading(false);
        return newQuestions;
      } else {
        // Mock data for demo
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newQuestions: QuestionData[] = [];
        for (let i = 0; i < batchSize; i++) {
          newQuestions.push(generateMockQuestion(fetchCount.current * batchSize + i));
        }
        fetchCount.current += 1;

        if (fetchCount.current >= 4) {
          setHasMore(false);
        }

        setQuestions((prev) => [...prev, ...newQuestions]);
        setTotalFetched((prev) => prev + newQuestions.length);
        setIsLoading(false);
        return newQuestions;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsLoading(false);
      return [];
    }
  }, [hasMore, endpoint, batchSize, topicId, difficulty, totalFetched]);

  const fetchSingle = useCallback(async (): Promise<QuestionData | null> => {
    const remainingQuestions = questions.length - currentIndex.current;
    if (remainingQuestions <= prefetchThreshold && hasMore && !isLoading) {
      fetchBatch();
    }

    if (currentIndex.current < questions.length) {
      const question = questions[currentIndex.current];
      currentIndex.current += 1;
      return question;
    }

    if (hasMore) {
      const newQuestions = await fetchBatch();
      if (newQuestions.length > 0) {
        const question = newQuestions[0];
        currentIndex.current = 1;
        return question;
      }
    }

    return null;
  }, [questions, hasMore, isLoading, prefetchThreshold, fetchBatch]);

  const getNextQuestion = useCallback((): QuestionData | null => {
    if (currentIndex.current < questions.length) {
      const question = questions[currentIndex.current];
      currentIndex.current += 1;

      const remainingQuestions = questions.length - currentIndex.current;
      if (remainingQuestions <= prefetchThreshold && hasMore && !isLoading) {
        fetchBatch();
      }

      return question;
    }
    return null;
  }, [questions, hasMore, isLoading, prefetchThreshold, fetchBatch]);

  const peekNextQuestions = useCallback(
    (count: number): QuestionData[] => {
      return questions.slice(currentIndex.current, currentIndex.current + count);
    },
    [questions]
  );

  const reset = useCallback(() => {
    setQuestions([]);
    setIsLoading(false);
    setError(null);
    setHasMore(true);
    setTotalFetched(0);
    currentIndex.current = 0;
    fetchCount.current = 0;
  }, []);

  return {
    questions,
    isLoading,
    error,
    hasMore,
    totalFetched,
    fetchBatch,
    fetchSingle,
    reset,
    getNextQuestion,
    peekNextQuestions,
  };
}

export default useQuestionFetcher;
