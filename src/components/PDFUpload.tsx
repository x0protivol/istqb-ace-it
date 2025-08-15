import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, CheckCircle2, AlertCircle, Brain, Target, Zap, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuestions } from '@/hooks/useQuestions'
import { supabase } from '@/lib/supabase'
import { expertAIProcessor, ExpertQuestion, ExpertProcessingResult } from '@/lib/expert-ai-processor'

interface ParsedQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  hint: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export const PDFUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [processedResults, setProcessedResults] = useState<ExpertProcessingResult | null>(null)
  const [testSets, setTestSets] = useState<{
    expert: ExpertQuestion[];
    master: ExpertQuestion[];
    champion: ExpertQuestion[];
    ultimate: ExpertQuestion[];
  } | null>(null)
  const [insights, setInsights] = useState<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    studyPlan: string[];
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { addQuestions } = useQuestions()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setProcessing(false)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (file.type !== 'application/pdf') {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a PDF file`,
            variant: "destructive"
          })
          continue
        }

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 50MB limit`,
            variant: "destructive"
          })
          continue
        }

        setProgress(20)
        
        // Upload file to Supabase Storage
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw uploadError
        }

        setProgress(40)
        setProcessing(true)

        // AI Processing: Extract content and generate questions
        try {
          const arrayBuffer = await file.arrayBuffer()
          const content = await expertAIProcessor.extractContent(arrayBuffer)
          
          setProgress(60)
          
          const result = await expertAIProcessor.generateExpertQuestions(content, fileName)
          setProcessedResults(result)
          
          setProgress(80)
          
          // Create test sets
          const testSetsResult = await expertAIProcessor.createExpertTestSets(result.questions)
          setTestSets(testSetsResult)
          
          // Generate insights
          const insightsResult = await expertAIProcessor.generateExpertInsights(result.questions)
          setInsights(insightsResult)
          
          setProgress(90)
          
          // Add questions to database (map expert difficulties to database format)
          await addQuestions(result.questions.map(q => ({
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            hint: q.hint,
            category: q.category,
            difficulty: q.difficulty === 'Expert' ? 'Easy' : q.difficulty === 'Master' ? 'Medium' : 'Hard',
            source_pdf: q.source_pdf
          })))
          
          setUploadedFiles(prev => [...prev, file.name])
          
          toast({
            title: "AI Processing Complete!",
            description: `Generated ${result.questions.length} intelligent questions from ${file.name}`,
          })
          
        } catch (processingError) {
          console.error('AI processing error:', processingError)
          toast({
            title: "AI Processing Failed",
            description: "Using fallback question generation",
            variant: "destructive"
          })
          
          // Fallback to simulated questions
          const parsedQuestions = await simulatePDFParsing(file.name)
          if (parsedQuestions.length > 0) {
            await addQuestions(parsedQuestions.map(q => ({
              ...q,
              source_pdf: fileName
            })))
            setUploadedFiles(prev => [...prev, file.name])
          }
        }

        setProgress(100)
      }
    } catch (error) {
      console.error('Error uploading PDF:', error)
      toast({
        title: "Upload Failed",
        description: "There was an error processing your PDF files",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setProcessing(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Simulate PDF parsing - in a real app, you'd use a PDF parsing library
  const simulatePDFParsing = async (fileName: string): Promise<ParsedQuestion[]> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return sample questions based on filename
    const sampleQuestions: ParsedQuestion[] = [
      {
        question: "What is the primary objective of software testing?",
        options: [
          "To find all defects in the software",
          "To prove that the software is bug-free",
          "To reduce the risk of failures in operation",
          "To increase development speed"
        ],
        correct_answer: 2,
        explanation: "The primary objective of testing is to reduce the risk of failures occurring in an operational environment by finding defects and providing information about software quality.",
        hint: "Focus on risk reduction rather than proving perfection.",
        category: "Fundamentals of Testing",
        difficulty: "Medium"
      },
      {
        question: "Which of the following is NOT a principle of testing?",
        options: [
          "Testing shows the presence of defects",
          "Exhaustive testing is possible",
          "Early testing saves time and money",
          "Defect clustering"
        ],
        correct_answer: 1,
        explanation: "Exhaustive testing is impossible because it would require testing all possible combinations of inputs and preconditions, which is not feasible for non-trivial software.",
        hint: "Think about what is practically impossible in testing.",
        category: "Testing Principles",
        difficulty: "Easy"
      },
      {
        question: "What is the main characteristic of black-box testing?",
        options: [
          "Tests are based on code structure",
          "Tests are based on specifications and requirements",
          "Tests require knowledge of internal design",
          "Tests focus on code coverage"
        ],
        correct_answer: 1,
        explanation: "Black-box testing is based on specifications, requirements, and the functionality of the software without knowledge of its internal structure.",
        hint: "Consider what information is used to design the tests.",
        category: "Test Design Techniques",
        difficulty: "Easy"
      }
    ]

    return sampleQuestions
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload PDF Questions
        </CardTitle>
        <CardDescription>
          Upload your ISTQB question bank PDF files to import questions automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="cursor-pointer"
            style={{ opacity: uploading ? 0.6 : 1 }}
          />
          
          {(uploading || processing) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                {processing ? 'AI Processing PDF content...' : 'Uploading PDF file...'}
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {processing 
                  ? 'Extracting content and generating intelligent questions with AI...' 
                  : 'This may take a few moments for large files'
                }
              </p>
            </div>
          )}

          {processedResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-success">
                <Brain className="h-5 w-5" />
                <h4 className="font-medium">AI Processing Results</h4>
              </div>
              
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="tests">Test Sets</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{processedResults.summary.total_questions}</div>
                      <div className="text-xs text-muted-foreground">Total Questions</div>
                    </div>
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">{processedResults.summary.expert_count}</div>
                      <div className="text-xs text-muted-foreground">Expert</div>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <div className="text-2xl font-bold text-warning">{processedResults.summary.master_count}</div>
                      <div className="text-xs text-muted-foreground">Master</div>
                    </div>
                    <div className="text-center p-3 bg-destructive/10 rounded-lg">
                      <div className="text-2xl font-bold text-destructive">{processedResults.summary.champion_count}</div>
                      <div className="text-xs text-muted-foreground">Champion</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium">Topics Covered:</h5>
                    <div className="flex flex-wrap gap-2">
                      {processedResults.summary.topics_covered.map((topic, index) => (
                        <Badge key={index} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold">{processedResults.summary.estimated_exam_time} min</div>
                      <div className="text-xs text-muted-foreground">Estimated Time</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold">{processedResults.summary.recommended_pass_score}%</div>
                      <div className="text-xs text-muted-foreground">Pass Score</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tests" className="space-y-4">
                  {testSets && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-success" />
                          Expert Test ({testSets.expert.length} questions)
                        </h5>
                        <p className="text-sm text-muted-foreground">Advanced testing concepts and methodologies</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-warning" />
                          Master Test ({testSets.master.length} questions)
                        </h5>
                        <p className="text-sm text-muted-foreground">Expert-level scenarios and analysis</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-destructive" />
                          Champion Test ({testSets.champion.length} questions)
                        </h5>
                        <p className="text-sm text-muted-foreground">Ultimate challenge scenarios</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-primary/5">
                        <h5 className="font-medium flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-primary" />
                          Ultimate Test ({testSets.ultimate.length} questions)
                        </h5>
                        <p className="text-sm text-muted-foreground">Highest complexity questions for champions</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="insights" className="space-y-4">
                  {insights && (
                    <div className="space-y-4">
                      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                        <h5 className="font-medium text-success mb-2">Strengths</h5>
                        <ul className="space-y-1 text-sm">
                          {insights.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                        <h5 className="font-medium text-warning mb-2">Areas for Improvement</h5>
                        <ul className="space-y-1 text-sm">
                          {insights.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-warning" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <h5 className="font-medium text-primary mb-2">Study Plan</h5>
                        <ul className="space-y-1 text-sm">
                          {insights.studyPlan.map((step, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="files" className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Successfully Processed Files:
                  </h4>
                  <ul className="space-y-1">
                    {uploadedFiles.map((fileName, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {fileName}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="p-4 bg-accent/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">PDF Format Requirements:</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• Questions should be clearly numbered</li>
                  <li>• Multiple choice options (A, B, C, D)</li>
                  <li>• Correct answers and explanations included</li>
                  <li>• Categories/topics specified</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}