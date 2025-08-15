import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, Zap, BarChart3, Clock, Trophy, BookOpen, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TestSet {
  expert: any[];
  master: any[];
  champion: any[];
  ultimate: any[];
}

interface AdvancedExamSelectorProps {
  testSets: TestSet | null;
  onStartExam: (questions: any[], difficulty: string) => void;
}

export const AdvancedExamSelector = ({ testSets, onStartExam }: AdvancedExamSelectorProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ultimate');
  const navigate = useNavigate();

  if (!testSets) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Advanced Exam Options
          </CardTitle>
          <CardDescription>
            Upload a PDF first to access AI-generated test sets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No test sets available yet</p>
            <p className="text-sm">Upload a PDF to generate intelligent test sets</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTestInfo = (difficulty: string) => {
    const questions = testSets[difficulty as keyof TestSet] || [];
    const timePerQuestion = difficulty === 'expert' ? 90 : difficulty === 'master' ? 120 : difficulty === 'champion' ? 150 : 180;
    const totalTime = questions.length * timePerQuestion;
    
    return {
      questions,
      count: questions.length,
      timePerQuestion,
      totalTime,
      passScore: difficulty === 'expert' ? 80 : difficulty === 'master' ? 85 : difficulty === 'champion' ? 90 : 95,
      description: {
        expert: 'Advanced testing concepts and methodologies - Expert level',
        master: 'Expert-level scenarios and analysis - Master challenges',
        champion: 'Ultimate challenge scenarios - Champion level',
        ultimate: 'Highest complexity questions - Ultimate mastery'
      }[difficulty]
    };
  };

  const handleStartExam = (difficulty: string) => {
    const testInfo = getTestInfo(difficulty);
    if (testInfo.questions.length > 0) {
      onStartExam(testInfo.questions, difficulty);
      navigate('/quiz');
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Generated Test Sets
        </CardTitle>
        <CardDescription>
          Choose your preferred difficulty level and start practicing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expert" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Expert
          </TabsTrigger>
          <TabsTrigger value="master" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Master
          </TabsTrigger>
          <TabsTrigger value="champion" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Champion
          </TabsTrigger>
          <TabsTrigger value="ultimate" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Ultimate
          </TabsTrigger>
        </TabsList>

          {(['expert', 'master', 'champion', 'ultimate'] as const).map((difficulty) => {
            const testInfo = getTestInfo(difficulty);
            
            return (
              <TabsContent key={difficulty} value={difficulty} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                                              <h3 className="font-semibold mb-2 flex items-center gap-2">
                          {difficulty === 'expert' && <Target className="h-5 w-5 text-success" />}
                          {difficulty === 'master' && <Zap className="h-5 w-5 text-warning" />}
                          {difficulty === 'champion' && <BarChart3 className="h-5 w-5 text-destructive" />}
                          {difficulty === 'ultimate' && <Brain className="h-5 w-5 text-primary" />}
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Test
                        </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {testInfo.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">{testInfo.count}</div>
                          <div className="text-xs text-muted-foreground">Questions</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-warning">{testInfo.totalTime}</div>
                          <div className="text-xs text-muted-foreground">Minutes</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Time per question:</span>
                        <Badge variant="outline">{testInfo.timePerQuestion}s</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pass score:</span>
                        <Badge variant="outline">{testInfo.passScore}%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Difficulty:</span>
                        <Badge 
                          variant={
                            difficulty === 'expert' ? 'default' : 
                            difficulty === 'master' ? 'secondary' : 'destructive'
                          }
                        >
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        What you'll learn
                      </h4>
                                              <ul className="space-y-2 text-sm">
                          {difficulty === 'expert' && (
                            <>
                              <li>• Advanced testing methodologies</li>
                              <li>• Risk-based testing strategies</li>
                              <li>• Test automation frameworks</li>
                              <li>• Performance testing approaches</li>
                            </>
                          )}
                          {difficulty === 'master' && (
                            <>
                              <li>• Test-driven development (TDD)</li>
                              <li>• Advanced test design techniques</li>
                              <li>• Test process improvement</li>
                              <li>• Test metrics and measurements</li>
                            </>
                          )}
                          {difficulty === 'champion' && (
                            <>
                              <li>• Microservices testing challenges</li>
                              <li>• Mutation testing principles</li>
                              <li>• Test architecture design</li>
                              <li>• Advanced CI/CD integration</li>
                            </>
                          )}
                          {difficulty === 'ultimate' && (
                            <>
                              <li>• Ultimate testing mastery</li>
                              <li>• Real-world expert scenarios</li>
                              <li>• Advanced problem solving</li>
                              <li>• Champion-level challenges</li>
                            </>
                          )}
                        </ul>
                    </div>

                    <Button 
                      onClick={() => handleStartExam(difficulty)}
                      disabled={testInfo.count === 0}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Test
                    </Button>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}; 