'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Zap,
  ArrowLeft,
  Info,
  CheckCircle2,
  Clock,
  Target,
  RotateCcw,
} from 'lucide-react';
import { QtiProvider } from '@/components/qti/qti-context';
import { AssessmentMode, type AssessmentResults } from '@/components/quiz/modes/AssessmentMode';
import { StreamMode, type StreamResults } from '@/components/quiz/modes/StreamMode';
import { useQuestionFetcher } from '@/components/quiz/hooks/useQuestionFetcher';
import type { QuestionData } from '@/lib/quiz/types';

// Sample questions for assessment mode (QTI 3.0 format)
const assessmentQuestions: QuestionData[] = [
  {
    id: 'assess-1',
    type: 'choice',
    title: 'What is the chemical symbol for Gold?',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="assess-1"
                      title="Gold Symbol"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>What is the chemical symbol for Gold?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">Ag</qti-simple-choice>
      <qti-simple-choice identifier="B">Au</qti-simple-choice>
      <qti-simple-choice identifier="C">Go</qti-simple-choice>
      <qti-simple-choice identifier="D">Gd</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'assess-2',
    type: 'textEntry',
    title: 'What year did World War II end?',
    points: 15,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="assess-2"
                      title="WWII End Year"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-correct-response>
      <qti-value>1945</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>What year did World War II end?</p>
    <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="10"/>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'assess-3',
    type: 'choice',
    title: 'Which planet has the most moons?',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="assess-3"
                      title="Most Moons"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>Which planet in our solar system has the most moons?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">Jupiter</qti-simple-choice>
      <qti-simple-choice identifier="B">Saturn</qti-simple-choice>
      <qti-simple-choice identifier="C">Uranus</qti-simple-choice>
      <qti-simple-choice identifier="D">Neptune</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'assess-4',
    type: 'choice',
    title: 'What is the speed of light (approximately)?',
    points: 15,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="assess-4"
                      title="Speed of Light"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>A</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>What is the approximate speed of light in vacuum?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">300,000 km/s</qti-simple-choice>
      <qti-simple-choice identifier="B">150,000 km/s</qti-simple-choice>
      <qti-simple-choice identifier="C">500,000 km/s</qti-simple-choice>
      <qti-simple-choice identifier="D">1,000,000 km/s</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'assess-5',
    type: 'textEntry',
    title: 'Name the largest bone in the human body',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="assess-5"
                      title="Largest Bone"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-correct-response>
      <qti-value>Femur</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>Name the largest bone in the human body:</p>
    <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="20"/>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
];

// Sample questions for stream mode (QTI 3.0 format)
const streamQuestions: QuestionData[] = [
  {
    id: 'stream-1',
    type: 'choice',
    title: 'What is 15 + 27?',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="stream-1"
                      title="Addition"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>A</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>What is 15 + 27?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">42</qti-simple-choice>
      <qti-simple-choice identifier="B">41</qti-simple-choice>
      <qti-simple-choice identifier="C">43</qti-simple-choice>
      <qti-simple-choice identifier="D">40</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'stream-2',
    type: 'choice',
    title: 'Which color is NOT in the rainbow?',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="stream-2"
                      title="Rainbow Colors"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>Which color is NOT in the rainbow?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">Red</qti-simple-choice>
      <qti-simple-choice identifier="B">Pink</qti-simple-choice>
      <qti-simple-choice identifier="C">Violet</qti-simple-choice>
      <qti-simple-choice identifier="D">Orange</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'stream-3',
    type: 'textEntry',
    title: 'What is 8 x 7?',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="stream-3"
                      title="Multiplication"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-correct-response>
      <qti-value>56</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>What is 8 x 7?</p>
    <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="10"/>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'stream-4',
    type: 'choice',
    title: 'How many continents are there?',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="stream-4"
                      title="Continents"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>C</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>How many continents are there on Earth?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">5</qti-simple-choice>
      <qti-simple-choice identifier="B">6</qti-simple-choice>
      <qti-simple-choice identifier="C">7</qti-simple-choice>
      <qti-simple-choice identifier="D">8</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
  {
    id: 'stream-5',
    type: 'choice',
    title: 'What is the smallest prime number?',
    points: 10,
    xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="stream-5"
                      title="Prime Number"
                      adaptive="false"
                      time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>C</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>What is the smallest prime number?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">0</qti-simple-choice>
      <qti-simple-choice identifier="B">1</qti-simple-choice>
      <qti-simple-choice identifier="C">2</qti-simple-choice>
      <qti-simple-choice identifier="D">3</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
  },
];

type DemoMode = 'select' | 'assessment' | 'stream';

export default function QuizModesDemo() {
  const [mode, setMode] = useState<DemoMode>('select');
  const [lastAssessmentResults, setLastAssessmentResults] = useState<AssessmentResults | null>(null);
  const [lastStreamResults, setLastStreamResults] = useState<StreamResults | null>(null);

  const questionFetcher = useQuestionFetcher({
    batchSize: 5,
    prefetchThreshold: 2,
  });

  const handleAssessmentComplete = (results: AssessmentResults) => {
    setLastAssessmentResults(results);
    console.log('Assessment completed:', results);
  };

  const handleStreamComplete = (results: StreamResults) => {
    setLastStreamResults(results);
    console.log('Stream completed:', results);
  };

  const handleBack = () => {
    setMode('select');
    questionFetcher.reset();
  };

  const handleStartStream = async () => {
    await questionFetcher.fetchBatch();
    setMode('stream');
  };

  if (mode === 'assessment') {
    return (
      <QtiProvider>
        <div className="min-h-screen">
          <div className="bg-background border-b p-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mode Selection
            </Button>
          </div>
          <AssessmentMode
            title="General Knowledge Assessment"
            description="Test your knowledge across various subjects. You can navigate between questions and review your answers before submitting."
            questions={assessmentQuestions}
            timeLimit={300}
            allowReview={true}
            showQuestionList={true}
            onComplete={handleAssessmentComplete}
          />
        </div>
      </QtiProvider>
    );
  }

  if (mode === 'stream') {
    const questions = questionFetcher.questions.length > 0 ? questionFetcher.questions : streamQuestions;

    return (
      <QtiProvider>
        <div className="min-h-screen">
          <div className="bg-background border-b p-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mode Selection
            </Button>
          </div>
          <StreamMode
            title="Quick Fire Challenge"
            description="Answer as many questions as you can! Build streaks for bonus points."
            questions={questions}
            timeLimit={120}
            questionTimeLimit={15}
            fetchNextQuestion={questionFetcher.fetchSingle}
            showStreak={true}
            showScore={true}
            onSessionComplete={handleStreamComplete}
          />
        </div>
      </QtiProvider>
    );
  }

  // Mode selection screen
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Quiz Modes Demo</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore two different quiz interaction modes. Choose Assessment for a traditional test
            experience, or Stream for fast-paced question answering.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Assessment Mode Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Assessment Mode</CardTitle>
                  <CardDescription>Traditional test experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Navigate back and forth between questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Review and change answers before submitting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Flag questions for later review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Submit all answers at once</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Optional time limit for entire assessment</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary">5 Questions</Badge>
                <Badge variant="outline">5 min time limit</Badge>
              </div>

              <Button className="w-full" size="lg" onClick={() => setMode('assessment')}>
                <BookOpen className="w-5 h-5 mr-2" />
                Start Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Stream Mode Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                  <Zap className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Stream Mode</CardTitle>
                  <CardDescription>Fast-paced challenge</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Answer questions one at a time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Immediate submission after each answer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Build streaks for bonus points</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>No going back - keep moving forward</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span>Per-question time limits add pressure</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary">Unlimited Questions</Badge>
                <Badge variant="outline">2 min session</Badge>
                <Badge variant="outline">15s per question</Badge>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                size="lg"
                onClick={handleStartStream}
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Stream Challenge
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> These quizzes use sample questions for demonstration. In a
            real application, questions would be fetched from the server in batches of 5, with
            automatic prefetching to ensure smooth transitions.
          </AlertDescription>
        </Alert>

        {/* Previous Results */}
        {(lastAssessmentResults || lastStreamResults) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Previous Session Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={lastStreamResults ? 'stream' : 'assessment'}>
                <TabsList>
                  {lastAssessmentResults && <TabsTrigger value="assessment">Assessment</TabsTrigger>}
                  {lastStreamResults && <TabsTrigger value="stream">Stream</TabsTrigger>}
                </TabsList>

                {lastAssessmentResults && (
                  <TabsContent value="assessment" className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                          {lastAssessmentResults.answeredQuestions}/{lastAssessmentResults.totalQuestions}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">Answered</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="text-xl font-bold text-green-700 dark:text-green-400">
                          {Math.round(
                            (lastAssessmentResults.answeredQuestions / lastAssessmentResults.totalQuestions) * 100
                          )}%
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-500">Completion</div>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                        <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                          {lastAssessmentResults.flaggedQuestions.length}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-500">Flagged</div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <div className="text-xl font-bold text-purple-700 dark:text-purple-400">
                          {Math.floor(lastAssessmentResults.timeSpent / 60)}:
                          {(lastAssessmentResults.timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-500">Time</div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {lastStreamResults && (
                  <TabsContent value="stream" className="pt-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                          {lastStreamResults.totalScore}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-500">Score</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="text-xl font-bold text-green-700 dark:text-green-400">
                          {lastStreamResults.correctAnswers}/{lastStreamResults.totalQuestions}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-500">Correct</div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <div className="text-xl font-bold text-purple-700 dark:text-purple-400">
                          {lastStreamResults.longestStreak}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-500">Best Streak</div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                          {Math.round(lastStreamResults.averageTimePerQuestion)}s
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">Avg Time</div>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
