
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuizProvider, useQuiz } from "./QuizContext";
import QtiItemViewer from "@/components/qti/qti-item-viewer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle, Flag } from "lucide-react";
import type { QuestionData } from "@/lib/quiz/types";

// Inner component to access QuizContext
function AssessmentPlayerInner({
    sessionId,
    initialQuestions
}: {
    sessionId: string;
    initialQuestions: QuestionData[]
}) {
    const router = useRouter();
    const {
        state,
        loadQuestions,
        nextQuestion,
        previousQuestion,
        submitResponse,
        submitQuiz
    } = useQuiz();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentItemRef = useRef<any>(null); // Reference to the underlying QTI item

    // Load questions on mount
    useEffect(() => {
        if (initialQuestions.length > 0) {
            loadQuestions(initialQuestions);
        }
    }, [initialQuestions, loadQuestions]);

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;

    // Handler for when QTI item is loaded and connected
    const handleItemLoaded = () => {
        // We could get a ref to the QTI item here if needed
        console.log("Item loaded");
    };

    const handleNext = async () => {
        // TODO: Extract response from QTI item
        // For now, we'll just simulate a response or rely on the QTI component's internal state if it emits events
        // Assuming we might need to get the response value here:
        // const response = currentItemRef.current?.getResponse(); 
        // submitResponse(response);

        // For this implementation, we just move next. 
        // Real implementation requires communicating with certain QTI component methods.

        if (isLastQuestion) {
            setIsSubmitting(true);
            submitQuiz();
            // Navigate to results
            router.push(`/practice/${sessionId}/result`);
        } else {
            nextQuestion();
        }
    };

    if (!currentQuestion) {
        return <div className="p-8 text-center">Loading assessment...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Question {state.currentQuestionIndex + 1}</span>
                    <span>of {state.questions.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Timer could go here */}
                    <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                    </Button>
                </div>
            </div>

            <Card className="p-6 min-h-[400px] mb-6 flex flex-col">
                <div className="flex-1">
                    <QtiItemViewer
                        key={currentQuestion.id} // Force re-render on question change
                        itemXML={currentQuestion.xmlContent}
                        onItemLoaded={handleItemLoaded}
                    />
                </div>
            </Card>

            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={state.currentQuestionIndex === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>

                <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className={isLastQuestion ? "bg-green-600 hover:bg-green-700" : ""}
                >
                    {isLastQuestion ? (
                        <>
                            Finish & Submit
                            <CheckCircle className="h-4 w-4 ml-2" />
                        </>
                    ) : (
                        <>
                            Next Question
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

// Wrapper to provide context
export default function ClientAssessmentPlayer(props: {
    sessionId: string;
    initialQuestions: QuestionData[]
}) {
    return (
        <QuizProvider>
            <AssessmentPlayerInner {...props} />
        </QuizProvider>
    );
}
