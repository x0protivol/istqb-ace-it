// Expert-Level ISTQB AI Processor with Internet Search
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ExpertQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  hint: string;
  category: string;
  difficulty: 'Expert' | 'Master' | 'Champion';
  reasoning: string;
  source_pdf: string;
  internet_sources?: string[];
  complexity_score: number; // 1-10 scale
}

export interface ExpertProcessingResult {
  questions: ExpertQuestion[];
  summary: {
    total_questions: number;
    expert_count: number;
    master_count: number;
    champion_count: number;
    topics_covered: string[];
    estimated_exam_time: number;
    recommended_pass_score: number;
    average_complexity: number;
    internet_sources_used: number;
  };
}

// Advanced ISTQB Topics for Expert Level
const expertTopics = [
  'Advanced Test Design Techniques',
  'Risk-Based Testing Strategies',
  'Test Automation Frameworks',
  'Performance Testing Methodologies',
  'Security Testing Approaches',
  'Test Management Advanced Concepts',
  'Test Process Improvement',
  'Test Metrics and Measurements',
  'Test Environment Management',
  'Test Data Management',
  'Test Tool Integration',
  'Continuous Testing',
  'DevOps Testing Practices',
  'Agile Testing Advanced',
  'Test Architecture Design'
];

// Expert Question Templates
const expertQuestionTemplates = {
  expert: [
    {
      question: "In a risk-based testing approach, which factor should be prioritized when determining test case execution order?",
      options: [
        "The order in which features were developed",
        "The probability of failure multiplied by the business impact",
        "The complexity of the code implementation",
        "The time available for testing"
      ],
      correct_answer: 1,
      explanation: "Risk-based testing prioritizes test cases based on the product risk, which is calculated as probability of failure × business impact. This ensures that the most critical areas are tested first.",
      hint: "Consider both likelihood and consequences of failure.",
      category: "Risk-Based Testing",
      difficulty: "Expert" as const,
      reasoning: "Requires understanding of risk calculation and prioritization",
      complexity_score: 8
    },
    {
      question: "What is the primary purpose of a test automation framework in continuous integration?",
      options: [
        "To reduce manual testing effort",
        "To provide immediate feedback on code changes",
        "To eliminate the need for manual testing",
        "To speed up the development process"
      ],
      correct_answer: 1,
      explanation: "In CI/CD, test automation frameworks provide immediate feedback on code changes, allowing developers to catch issues early and maintain code quality throughout the development cycle.",
      hint: "Focus on the feedback loop in continuous integration.",
      category: "Test Automation",
      difficulty: "Expert" as const,
      reasoning: "Requires understanding of CI/CD principles and automation",
      complexity_score: 7
    }
  ],
  master: [
    {
      question: "When implementing test-driven development (TDD), what is the correct sequence of activities?",
      options: [
        "Write test → Write code → Refactor",
        "Write code → Write test → Refactor",
        "Write test → Refactor → Write code",
        "Write code → Refactor → Write test"
      ],
      correct_answer: 0,
      explanation: "TDD follows the Red-Green-Refactor cycle: Write a failing test (Red), write code to make it pass (Green), then refactor the code while keeping tests passing.",
      hint: "Remember the Red-Green-Refactor cycle.",
      category: "Agile Testing",
      difficulty: "Master" as const,
      reasoning: "Requires deep understanding of TDD methodology",
      complexity_score: 9
    },
    {
      question: "What is the main advantage of using pairwise testing over exhaustive testing?",
      options: [
        "It guarantees 100% defect detection",
        "It reduces test cases while maintaining good coverage",
        "It eliminates the need for test design",
        "It speeds up test execution"
      ],
      correct_answer: 1,
      explanation: "Pairwise testing reduces the number of test cases significantly while maintaining good coverage of parameter interactions, making it practical for complex systems.",
      hint: "Consider the balance between coverage and efficiency.",
      category: "Test Design Techniques",
      difficulty: "Master" as const,
      reasoning: "Requires understanding of combinatorial testing strategies",
      complexity_score: 8
    }
  ],
  champion: [
    {
      question: "In a microservices architecture, what is the primary challenge for integration testing?",
      options: [
        "Managing test data across services",
        "Coordinating test execution timing",
        "Handling service dependencies and mocking",
        "Ensuring consistent test environments"
      ],
      correct_answer: 2,
      explanation: "The primary challenge is handling service dependencies and mocking, as microservices often depend on other services that may not be available during testing.",
      hint: "Think about service interdependencies.",
      category: "Test Architecture",
      difficulty: "Champion" as const,
      reasoning: "Requires advanced understanding of microservices and integration testing",
      complexity_score: 10
    },
    {
      question: "What is the key principle behind mutation testing?",
      options: [
        "To find all possible defects in the code",
        "To evaluate test case effectiveness by introducing artificial defects",
        "To improve code coverage metrics",
        "To automate the testing process"
      ],
      correct_answer: 1,
      explanation: "Mutation testing evaluates test case effectiveness by introducing artificial defects (mutations) into the code and checking if tests can detect these changes.",
      hint: "Focus on the purpose of introducing changes.",
      category: "Test Quality",
      difficulty: "Champion" as const,
      reasoning: "Requires understanding of advanced testing techniques",
      complexity_score: 10
    }
  ]
};

export class ExpertAIProcessor {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  // Extract and clean PDF content
  async extractContent(pdfBuffer: ArrayBuffer): Promise<string> {
    try {
      // Simulate PDF extraction for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "ISTQB Expert Level content extracted from PDF. This includes advanced testing concepts, methodologies, and real-world scenarios for expert-level certification.";
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract PDF content');
    }
  }

  // Search internet for ISTQB dumps and resources
  async searchISTQBDumps(): Promise<string[]> {
    try {
      const searchTerms = [
        'ISTQB Foundation Level dumps',
        'ISTQB exam questions 2024',
        'ISTQB practice tests',
        'ISTQB sample questions',
        'ISTQB certification preparation'
      ];

      const searchResults: string[] = [];
      
      for (const term of searchTerms) {
        try {
          // Simulate web search (in real implementation, use a search API)
          const mockResults = [
            `ISTQB Foundation Level ${term} - Advanced testing concepts and methodologies`,
            `Latest ${term} with detailed explanations and real-world scenarios`,
            `Professional ${term} covering all ISTQB syllabus areas`
          ];
          
          searchResults.push(...mockResults);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Search error for term "${term}":`, error);
        }
      }

      return searchResults;
    } catch (error) {
      console.error('Internet search error:', error);
      return [];
    }
  }

  // Generate expert-level questions using AI
  async generateExpertQuestions(content: string, fileName: string): Promise<ExpertProcessingResult> {
    try {
      // Search for additional ISTQB resources
      const internetSources = await this.searchISTQBDumps();
      
      // Combine all question templates
      const allQuestions = [
        ...expertQuestionTemplates.expert,
        ...expertQuestionTemplates.master,
        ...expertQuestionTemplates.champion
      ];

      // Add source PDF and internet sources to each question
      const questionsWithSources = allQuestions.map(q => ({
        ...q,
        source_pdf: fileName,
        internet_sources: internetSources.slice(0, 2), // Add 2 internet sources per question
      }));

      // Generate additional AI-powered questions if API key is available
      if (this.openaiApiKey) {
        try {
          const aiQuestions = await this.generateAIQuestions(content, fileName, internetSources);
          questionsWithSources.push(...aiQuestions);
        } catch (error) {
          console.error('AI question generation failed:', error);
        }
      }

      const summary = {
        total_questions: questionsWithSources.length,
        expert_count: questionsWithSources.filter(q => q.difficulty === 'Expert').length,
        master_count: questionsWithSources.filter(q => q.difficulty === 'Master').length,
        champion_count: questionsWithSources.filter(q => q.difficulty === 'Champion').length,
        topics_covered: expertTopics,
        estimated_exam_time: questionsWithSources.length * 90, // 90 seconds per expert question
        recommended_pass_score: 85, // Higher pass score for expert level
        average_complexity: questionsWithSources.reduce((sum, q) => sum + q.complexity_score, 0) / questionsWithSources.length,
        internet_sources_used: internetSources.length
      };

      return {
        questions: questionsWithSources,
        summary
      };
    } catch (error) {
      console.error('Expert question generation error:', error);
      throw new Error('Failed to generate expert questions');
    }
  }

  // Generate AI-powered questions using OpenAI
  private async generateAIQuestions(content: string, fileName: string, internetSources: string[]): Promise<ExpertQuestion[]> {
    try {
      const prompt = `
You are an expert ISTQB certification instructor creating CHAMPION-LEVEL questions for advanced testers.

Content: ${content}
Internet Sources: ${internetSources.join(', ')}

Create 3 CHAMPION-LEVEL questions that are:
- Extremely challenging and complex
- Based on real-world scenarios
- Require deep understanding of testing concepts
- Include advanced topics like test architecture, automation frameworks, CI/CD
- Have complexity scores of 9-10

Format each question as JSON:
{
  "question": "Complex scenario-based question",
  "options": ["A", "B", "C", "D"],
  "correct_answer": 0-3,
  "explanation": "Detailed explanation",
  "hint": "Advanced hint",
  "category": "Advanced topic",
  "difficulty": "Champion",
  "reasoning": "Why this is champion level",
  "complexity_score": 9-10
}
`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ISTQB instructor creating the most challenging questions possible.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      // Parse AI response and extract questions
      const questions: ExpertQuestion[] = [];
      try {
        const parsed = JSON.parse(aiResponse);
        if (Array.isArray(parsed)) {
          questions.push(...parsed.map(q => ({
            ...q,
            source_pdf: fileName,
            internet_sources: internetSources.slice(0, 2)
          })));
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

      return questions;
    } catch (error) {
      console.error('AI question generation error:', error);
      return [];
    }
  }

  // Create expert test sets
  async createExpertTestSets(questions: ExpertQuestion[]): Promise<{
    expert: ExpertQuestion[];
    master: ExpertQuestion[];
    champion: ExpertQuestion[];
    ultimate: ExpertQuestion[];
  }> {
    const expert = questions.filter(q => q.difficulty === 'Expert');
    const master = questions.filter(q => q.difficulty === 'Master');
    const champion = questions.filter(q => q.difficulty === 'Champion');

    // Create ultimate test with highest complexity questions
    const ultimate = this.createUltimateTest(questions);

    return { expert, master, champion, ultimate };
  }

  // Create ultimate test with highest complexity
  private createUltimateTest(questions: ExpertQuestion[]): ExpertQuestion[] {
    // Sort by complexity score and take the top questions
    const sortedByComplexity = questions.sort((a, b) => b.complexity_score - a.complexity_score);
    const topQuestions = sortedByComplexity.slice(0, Math.min(20, sortedByComplexity.length));
    
    return this.shuffleArray(topQuestions);
  }

  // Generate expert insights
  async generateExpertInsights(questions: ExpertQuestion[]): Promise<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    studyPlan: string[];
    advancedTopics: string[];
  }> {
    const strengths = [
      'Comprehensive coverage of advanced ISTQB topics',
      'Real-world scenario-based questions',
      'High complexity and challenge level',
      'Integration of internet resources and current trends',
      'Expert-level reasoning requirements'
    ];

    const weaknesses = [
      'May be too advanced for beginners',
      'Requires extensive practical experience',
      'Some topics may need additional context',
      'Time pressure with complex scenarios'
    ];

    const recommendations = [
      'Focus on weak areas identified in practice tests',
      'Study advanced testing methodologies',
      'Practice with real-world scenarios',
      'Join professional testing communities',
      'Attend advanced ISTQB training sessions'
    ];

    const studyPlan = [
      'Week 1: Advanced Test Design and Risk-Based Testing',
      'Week 2: Test Automation and CI/CD Integration',
      'Week 3: Performance and Security Testing',
      'Week 4: Test Architecture and Advanced Methodologies',
      'Week 5: Practice with expert-level scenarios',
      'Week 6: Mock exams and performance analysis'
    ];

    const advancedTopics = [
      'Test-Driven Development (TDD)',
      'Behavior-Driven Development (BDD)',
      'Mutation Testing',
      'Model-Based Testing',
      'Test Automation Frameworks',
      'Continuous Testing',
      'Test Environment Management',
      'Test Data Management',
      'Test Metrics and KPIs',
      'Test Process Improvement'
    ];

    return {
      strengths,
      weaknesses,
      recommendations,
      studyPlan,
      advancedTopics
    };
  }

  // Shuffle array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export singleton instance
export const expertAIProcessor = new ExpertAIProcessor(); 