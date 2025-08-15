import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Lightbulb, Trophy, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExam } from "@/hooks/useExam";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  hint: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const Quiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { examSession, examQuestions, loading, startExam, updateAnswer, finishExam } = useExam();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize exam
  useEffect(() => {
    if (!hasStarted && !examSession) {
      initializeExam();
    }
  }, []);

  const initializeExam = async () => {
    const session = await startExam(60); // 60 questions
    if (session) {
      setTimeLeft(session.total_time);
      setStartTime(Date.now());
      setHasStarted(true);
    } else {
      navigate('/');
    }
  };

  // Get current answers from session
  useEffect(() => {
    if (examSession && currentQuestion < examSession.answers.length) {
      const answer = examSession.answers[currentQuestion];
      setSelectedAnswer(answer >= 0 ? answer : null);
    }
  }, [currentQuestion, examSession]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && hasStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasStarted) {
      // Time's up!
      handleFinishExam();
    }
  }, [timeLeft, hasStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    if (examSession) {
      await updateAnswer(currentQuestion, answerIndex);
    }
  };

  const handleNext = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
      setShowExplanation(false);
    } else {
      handleFinishExam();
    }
  };

  const handleFinishExam = async () => {
    if (!examSession) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const completedSession = await finishExam(timeSpent);
    
    if (completedSession) {
      // Store results in localStorage for Results page
      localStorage.setItem('examResults', JSON.stringify({
        session: completedSession,
        questions: examQuestions
      }));
      navigate('/results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
      setShowExplanation(false);
    }
  };

  // Loading or no questions state
  if (loading || !examSession || examQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p>Setting up your exam...</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-8 w-8 text-warning mx-auto" />
                <p>No questions available. Please upload questions first.</p>
                <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / examQuestions.length) * 100;
  const question = examQuestions[currentQuestion];
  const timeWarning = timeLeft < 300; // Less than 5 minutes

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
              <span className="font-semibold">Question {currentQuestion + 1}</span>
            </div>
            <div className={`flex items-center gap-2 ${timeWarning ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
              <Clock className="h-5 w-5" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {examQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
          {timeWarning && (
            <div className="text-sm text-destructive font-medium">
              ⚠️ Less than 5 minutes remaining!
            </div>
          )}
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
                {currentQuestion === examQuestions.length - 1 ? "Finish" : "Next"}
                {currentQuestion < examQuestions.length - 1 && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;