import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, TrendingUp, CheckCircle2, XCircle, RotateCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuestionResult {
  id: string;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  category: string;
  explanation: string;
  difficulty: string;
}

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);

  useEffect(() => {
    // Get results from localStorage
    const examResultsData = localStorage.getItem('examResults');
    if (examResultsData) {
      const { session, questions } = JSON.parse(examResultsData);
      
      const accuracy = Math.round((session.score / questions.length) * 100);
      const passingScore = 65;
      
      setResults({
        totalQuestions: questions.length,
        correctAnswers: session.score,
        totalTime: session.time_spent,
        pointsEarned: session.score,
        accuracy,
        passingScore
      });

      // Create question results
      const questionResultsData = questions.map((question: any, index: number) => ({
        id: question.id,
        question: question.question,
        userAnswer: session.answers[index],
        correctAnswer: question.correct_answer,
        isCorrect: session.answers[index] === question.correct_answer,
        category: question.category,
        explanation: question.explanation,
        difficulty: question.difficulty
      }));

      setQuestionResults(questionResultsData);
    } else {
      // No results found, redirect to dashboard
      navigate('/');
    }
  }, [navigate]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isPassed = results.accuracy >= results.passingScore;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isPassed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}>
            {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="font-semibold">
              {isPassed ? 'Congratulations! You Passed!' : 'Keep Learning - You\'re Getting There!'}
            </span>
          </div>
          <h1 className="text-3xl font-bold">Exam Results</h1>
          <p className="text-muted-foreground">
            ISTQB Foundation Level Practice Test
          </p>
        </div>

        {/* Score Overview */}
        <Card className="shadow-quiz">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {results.accuracy}%
            </CardTitle>
            <CardDescription>Final Score</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={results.accuracy} className="h-4 mb-6" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-warning" />
                </div>
                <div className="text-2xl font-bold text-primary">{results.pointsEarned}</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Target className="h-8 w-8 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">{results.correctAnswers}/{results.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold">{formatTime(results.totalTime)}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <TrendingUp className={`h-8 w-8 ${isPassed ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div className={`text-2xl font-bold ${isPassed ? 'text-success' : 'text-destructive'}`}>
                  {isPassed ? 'PASS' : 'FAIL'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Question Analysis</CardTitle>
            <CardDescription>
              Review your answers and learn from explanations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionResults.map((result, index) => (
              <div key={result.id} className={`p-4 rounded-lg border ${
                result.isCorrect ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Q{index + 1}</Badge>
                      <Badge variant="outline">{result.category}</Badge>
                      {result.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm font-medium">{result.question}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Difficulty: {result.difficulty}</span>
                      <span className={result.isCorrect ? 'text-success' : 'text-destructive'}>
                        {result.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    {!result.isCorrect && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <p className="font-medium">Explanation:</p>
                        <p className="text-muted-foreground">{result.explanation}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${result.isCorrect ? 'text-success' : 'text-destructive'}`}>
                      {result.isCorrect ? '+1' : '0'} pts
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Study Recommendations</CardTitle>
            <CardDescription>
              Focus on these areas to improve your score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!isPassed && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <h4 className="font-semibold text-warning mb-2">Areas to Review:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Static Testing principles and techniques</li>
                    <li>• Review fundamental testing concepts</li>
                    <li>• Practice more questions in weak areas</li>
                  </ul>
                </div>
              )}
              
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Next Steps:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Take another practice exam to track improvement</li>
                  <li>• Review ISTQB syllabus sections you struggled with</li>
                  <li>• Join study groups or online forums for additional support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={() => navigate('/quiz')} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Exam
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;