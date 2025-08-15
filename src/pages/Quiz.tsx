import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Lightbulb, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// Sample ISTQB questions
const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "Which of the following is a characteristic of good testing?",
    options: [
      "Testing shows the presence of defects",
      "Exhaustive testing is possible", 
      "Testing can prove that software is defect-free",
      "Early testing is more expensive"
    ],
    correctAnswer: 0,
    explanation: "Testing can reveal the presence of defects but cannot prove their absence. This is one of the fundamental principles of testing.",
    hint: "Think about what testing can definitively prove versus what it can only indicate.",
    category: "Fundamentals of Testing",
    difficulty: "Easy"
  },
  {
    id: 2,
    question: "What is the main purpose of static testing?",
    options: [
      "To execute test cases",
      "To find defects without executing code",
      "To create test data",
      "To perform load testing"
    ],
    correctAnswer: 1,
    explanation: "Static testing involves examining code, requirements, and design documents without executing the software to find defects early in the development process.",
    hint: "Consider the difference between static and dynamic testing approaches.",
    category: "Static Testing",
    difficulty: "Medium"
  },
  {
    id: 3,
    question: "Which testing level focuses on interactions between integrated components?",
    options: [
      "Unit testing",
      "Integration testing", 
      "System testing",
      "Acceptance testing"
    ],
    correctAnswer: 1,
    explanation: "Integration testing specifically focuses on testing the interfaces and interactions between integrated components or systems.",
    hint: "Think about what happens when individual components are combined together.",
    category: "Test Levels",
    difficulty: "Easy"
  }
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(sampleQuestions.length).fill(-1));

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedAnswer !== null && selectedAnswer === sampleQuestions[currentQuestion].correctAnswer) {
      setScore(score + 10);
    }
    
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] !== -1 ? answers[currentQuestion + 1] : null);
      setShowHint(false);
      setShowExplanation(false);
    } else {
      // Exam finished, navigate to results
      navigate('/results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] !== -1 ? answers[currentQuestion - 1] : null);
      setShowHint(false);
      setShowExplanation(false);
    }
  };

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;
  const question = sampleQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ISTQB Practice Exam</h1>
            <p className="text-muted-foreground">Foundation Level Certification</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Trophy className="h-5 w-5" />
              <span className="font-semibold">{score} points</span>
            </div>
            <div className="flex items-center gap-2 text-destructive">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {sampleQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="shadow-quiz">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{question.category}</Badge>
                  <Badge variant={question.difficulty === "Easy" ? "default" : question.difficulty === "Medium" ? "secondary" : "destructive"}>
                    {question.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-relaxed">
                  {question.question}
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Hint
              </Button>
            </div>
            {showHint && (
              <div className="mt-4 p-4 bg-accent rounded-lg animate-slide-up">
                <p className="text-accent-foreground">{question.hint}</p>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={cn(
                    "w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-primary",
                    selectedAnswer === index
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                      selectedAnswer === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Explanation */}
            {selectedAnswer !== null && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="mb-3"
                >
                  {showExplanation ? "Hide" : "Show"} Explanation
                </Button>
                
                {showExplanation && (
                  <div className="p-4 bg-muted rounded-lg animate-slide-up">
                    <h4 className="font-semibold mb-2">Explanation:</h4>
                    <p className="text-muted-foreground">{question.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="flex items-center gap-2"
              >
                {currentQuestion === sampleQuestions.length - 1 ? "Finish" : "Next"}
                {currentQuestion < sampleQuestions.length - 1 && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;