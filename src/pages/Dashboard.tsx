import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, BookOpen, Trophy, Clock, TrendingUp, Target } from "lucide-react";

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
  const [stats] = useState<DashboardStats>({
    totalQuestions: 150,
    correctAnswers: 120,
    averageTime: "45s",
    streak: 12,
    points: 2450,
    level: "Foundation"
  });

  const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

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
              <div className="text-2xl font-bold text-primary">{stats.points}</div>
              <p className="text-xs text-muted-foreground">
                Level: {stats.level}
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
                {stats.correctAnswers}/{stats.totalQuestions} correct
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-quiz transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.streak}</div>
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
              <div className="text-2xl font-bold">{stats.averageTime}</div>
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
              <Button variant="quiz" size="lg" className="w-full">
                Choose Files
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-quiz transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <BookOpen className="h-5 w-5" />
                Start Practice Exam
              </CardTitle>
              <CardDescription>
                Begin a timed practice session with hints and explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/quiz')}>
                Start Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;