import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, BookOpen, Trophy, Clock, TrendingUp, Target, Brain } from "lucide-react";
import { PDFUpload } from "@/components/PDFUpload";
import { AdvancedExamSelector } from "@/components/AdvancedExamSelector";
import { useUserStats } from "@/hooks/useUserStats";
import { useQuestions } from "@/hooks/useQuestions";
import { useQuestionsCount } from "@/hooks/useQuestionsCount";

interface DashboardStats {
  totalQuestions: number;
  correctAnswers: number;
  averageTime: string;
  streak: number;
  points: number;
  level: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [testSets, setTestSets] = useState<any>(null);
  const { stats, loading: statsLoading } = useUserStats();
  const { count: questionsCount, loading: countLoading } = useQuestionsCount();

  const accuracy = stats ? Math.round((stats.correct_answers / (stats.total_questions || 1)) * 100) : 0;
  const hasQuestions = questionsCount > 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            ISTQB Exam Mastery
          </h1>
          <p className="text-muted-foreground text-lg">
            Master the ISTQB Foundation Level with interactive learning
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-quiz transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground">
                Level: Foundation
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-quiz transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{accuracy}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.correct_answers || 0}/{stats?.total_questions || 0} correct
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-quiz transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                questions in a row
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-quiz transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.average_time || 0}s</div>
              <p className="text-xs text-muted-foreground">
                per question
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Learning Progress
            </CardTitle>
            <CardDescription>
              Track your journey to ISTQB certification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{accuracy}%</span>
              </div>
              <Progress value={accuracy} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">Foundation</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-success">85%</div>
                <div className="text-sm text-muted-foreground">Pass Rate Required</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-warning">Ready</div>
                <div className="text-sm text-muted-foreground">Exam Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        {showUpload && (
          <div className="space-y-6">
            <PDFUpload />
            <AdvancedExamSelector 
              testSets={testSets}
              onStartExam={(questions, difficulty) => {
                // Handle starting exam with specific questions
                console.log(`Starting ${difficulty} exam with ${questions.length} questions`);
                navigate('/quiz');
              }}
            />
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Hide Advanced Options
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-card hover:shadow-quiz transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <Upload className="h-5 w-5" />
                Upload PDF Questions
              </CardTitle>
              <CardDescription>
                Import your ISTQB question bank from PDF files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="quiz" 
                size="lg" 
                className="w-full"
                onClick={() => setShowUpload(!showUpload)}
              >
                {showUpload ? 'Hide Upload' : 'Choose Files'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-quiz transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <Brain className="h-5 w-5" />
                AI-Generated Exams
              </CardTitle>
              <CardDescription>
                Choose from intelligent test sets with different difficulty levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full" 
                onClick={() => setShowUpload(true)}
                disabled={countLoading}
              >
                {countLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : hasQuestions ? 'View Test Sets' : 'Upload PDF First'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Questions Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Question Bank Status</CardTitle>
            <CardDescription>
              Current status of your question database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-success">{stats?.exams_taken || 0}</div>
                <div className="text-sm text-muted-foreground">Exams Taken</div>
              </div>
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold ${hasQuestions ? 'text-success' : 'text-warning'}`}>
                  {hasQuestions ? 'Ready' : 'Pending'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;