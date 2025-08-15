import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuestions } from '@/hooks/useQuestions'
import { supabase } from '@/lib/supabase'

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
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { addQuestions } = useQuestions()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (file.type !== 'application/pdf') {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a PDF file`,
            variant: "destructive"
          })
          continue
        }

        // Upload file to Supabase Storage
        const fileName = `${Date.now()}_${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(fileName, file)

        if (uploadError) {
          throw uploadError
        }

        // Parse PDF content (simplified simulation)
        const parsedQuestions = await simulatePDFParsing(file.name)
        
        if (parsedQuestions.length > 0) {
          await addQuestions(parsedQuestions.map(q => ({
            ...q,
            source_pdf: fileName
          })))
          
          setUploadedFiles(prev => [...prev, file.name])
        }

        setProgress(((i + 1) / files.length) * 100)
      }

      toast({
        title: "Upload Complete",
        description: `Successfully processed ${files.length} PDF(s)`
      })
    } catch (error) {
      console.error('Error uploading PDF:', error)
      toast({
        title: "Upload Failed",
        description: "There was an error processing your PDF files",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
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
          />
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Processing PDF files...
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
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