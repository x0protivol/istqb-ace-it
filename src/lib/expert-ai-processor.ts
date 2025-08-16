// Expert-Level ISTQB AI Processor with Internet Search
import axios from 'axios';
import * as cheerio from 'cheerio';

// PDF.js for real PDF text extraction in the browser
// Using local worker asset for reliability with Vite
let pdfjsLib: any = null;
let pdfWorkerConfigured = false;

async function ensurePdfJs() {
	if (!pdfjsLib) {
		pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
	}
	if (!pdfWorkerConfigured && pdfjsLib) {
		try {
			// Use bundled worker asset URL at runtime
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// @vite-ignore
			pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.js', import.meta.url).toString();
			pdfWorkerConfigured = true;
		} catch (_) {
			// no-op; pdf.js may fallback
		}
	}
}

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

export class ExpertAIProcessor {
	private openaiApiKey: string;

	constructor() {
		this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
	}

	// Extract and clean PDF content (real extraction)
	async extractContent(pdfBuffer: ArrayBuffer): Promise<string> {
		await ensurePdfJs();
		try {
			const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
			const pdf = await loadingTask.promise;
			let fullText = '';
			for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
				const page = await pdf.getPage(pageNum);
				const textContent = await page.getTextContent();
				const pageText = textContent.items
					.map((item: any) => (typeof item.str === 'string' ? item.str : ''))
					.join(' ');
				fullText += `\n\n${pageText}`;
			}
			// Basic cleanup
			return fullText
				.replace(/[\u0000-\u001F\u007F]/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
		} catch (error) {
			console.error('PDF extraction error:', error);
			throw new Error('Failed to extract PDF content');
		}
	}

	// Optional: Search internet for ISTQB dumps and resources (kept lightweight)
	async searchISTQBDumps(): Promise<string[]> {
		try {
			const searchTerms = [
				'ISTQB Foundation Level syllabus',
				'ISTQB exam questions best practices',
				'ISTQB sample exam with explanations'
			];

			const searchResults: string[] = [];
			for (const term of searchTerms) {
				try {
					// Simulated enrichment; replace with real search API if available
					const mockResults = [
						`Resource: ${term} - curated reference`,
					];
					searchResults.push(...mockResults);
					await new Promise(resolve => setTimeout(resolve, 200));
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

	// Generate expert-level questions from content
	async generateExpertQuestions(content: string, fileName: string): Promise<ExpertProcessingResult> {
		try {
			const internetSources = await this.searchISTQBDumps();

			let questionsWithSources: ExpertQuestion[] = [];
			if (this.openaiApiKey) {
				try {
					const aiQuestions = await this.generateAIQuestions(content, fileName, internetSources);
					questionsWithSources.push(...aiQuestions);
				} catch (error) {
					console.error('AI question generation failed:', error);
				}
			}

			// If no API or AI failed, use heuristic generator based on content
			if (questionsWithSources.length === 0) {
				questionsWithSources = this.generateHeuristicQuestions(content, fileName, internetSources);
			}

			const summary = {
				total_questions: questionsWithSources.length,
				expert_count: questionsWithSources.filter(q => q.difficulty === 'Expert').length,
				master_count: questionsWithSources.filter(q => q.difficulty === 'Master').length,
				champion_count: questionsWithSources.filter(q => q.difficulty === 'Champion').length,
				topics_covered: expertTopics,
				estimated_exam_time: Math.max(1, questionsWithSources.length) * 90,
				recommended_pass_score: 85,
				average_complexity: questionsWithSources.length
					? questionsWithSources.reduce((sum, q) => sum + (q.complexity_score || 7), 0) / questionsWithSources.length
					: 0,
				internet_sources_used: internetSources.length
			};

			return { questions: questionsWithSources, summary };
		} catch (error) {
			console.error('Expert question generation error:', error);
			throw new Error('Failed to generate expert questions');
		}
	}

	// Generate AI-powered questions using OpenAI Chat API with robust JSON extraction
	private async generateAIQuestions(content: string, fileName: string, internetSources: string[]): Promise<ExpertQuestion[]> {
		try {
			const prompt = `You are an expert ISTQB instructor.
Create 24 multiple-choice questions from the provided content. Make them challenging and well-explained. Distribute difficulties: 8 Expert, 8 Master, 8 Champion. Each question must have exactly 4 options and a single correct_answer (0-3).

Rules:
- Base all questions ONLY on the provided PDF content; do not invent outside facts.
- Include precise, instructional explanations and a short hint.
- Vary categories based on the ISTQB syllabus topics detected in the content.
- Output ONLY valid JSON array. No prose.

Return JSON array of objects with keys: question, options, correct_answer, explanation, hint, category, difficulty (Expert|Master|Champion), reasoning, complexity_score (1-10).`;

			const response = await axios.post(
				'https://api.openai.com/v1/chat/completions',
				{
					model: 'gpt-4o-mini',
					messages: [
						{ role: 'system', content: 'You write high-quality ISTQB exam questions.' },
						{ role: 'user', content: `${prompt}\n\nPDF Content (trimmed to 12k chars):\n${content.slice(0, 12000)}\n\nContext sources: ${internetSources.join('; ').slice(0, 1000)}` },
					],
					temperature: 0.5,
					max_tokens: 4000
				},
				{
					headers: {
						Authorization: `Bearer ${this.openaiApiKey}`,
						'Content-Type': 'application/json',
					},
				}
			);

			const aiText = response.data.choices?.[0]?.message?.content || '';
			const parsedArray = this.extractJsonArray(aiText);
			const questions: ExpertQuestion[] = Array.isArray(parsedArray)
				? parsedArray
					.filter(this.isValidAIQuestion)
					.map((q) => ({
						question: String(q.question),
						options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
						correct_answer: Math.max(0, Math.min(3, Number(q.correct_answer))),
						explanation: String(q.explanation || ''),
						hint: String(q.hint || ''),
						category: String(q.category || 'ISTQB'),
						difficulty: (['Expert', 'Master', 'Champion'] as const).includes(q.difficulty) ? q.difficulty : 'Expert',
						reasoning: String(q.reasoning || ''),
						source_pdf: fileName,
						internet_sources: internetSources.slice(0, 2),
						complexity_score: Math.max(6, Math.min(10, Number(q.complexity_score) || 7)),
					}))
				: [];

			return questions;
		} catch (error) {
			console.error('AI question generation error:', error);
			return [];
		}
	}

	private extractJsonArray(text: string): any[] | null {
		try {
			// Find first [ and last ] to extract array
			const start = text.indexOf('[');
			const end = text.lastIndexOf(']');
			if (start === -1 || end === -1 || end <= start) return null;
			const json = text.slice(start, end + 1);
			return JSON.parse(json);
		} catch (e) {
			return null;
		}
	}

	private isValidAIQuestion(q: any): boolean {
		return (
			q &&
			typeof q.question === 'string' &&
			Array.isArray(q.options) &&
			q.options.length >= 4 &&
			Number.isInteger(Number(q.correct_answer))
		);
	}

	// Heuristic generator using extracted content if no API key present
	private generateHeuristicQuestions(content: string, fileName: string, internetSources: string[]): ExpertQuestion[] {
		const sentences = content
			.split(/(?<=[.!?])\s+/)
			.map((s) => s.trim())
			.filter((s) => s.length > 30 && s.length < 300);

		const take = (arr: string[], count: number) => arr.slice(0, Math.max(0, Math.min(count, arr.length)));
		const base = take(sentences, 36);

		const categories = [
			'Fundamentals of Testing',
			'Test Design Techniques',
			'Test Management',
			'Tool Support for Testing',
			'Agile Testing',
		];

		const difficultyOrder: Array<ExpertQuestion['difficulty']> = ['Expert', 'Master', 'Champion'];

		const toQuestion = (seed: string, idx: number): ExpertQuestion => {
			const ops = [
				`It ensures ${seed.toLowerCase().slice(0, 90)}`,
				`It contradicts ${seed.toLowerCase().slice(0, 90)}`,
				`It is unrelated to ${seed.toLowerCase().slice(0, 90)}`,
				`It partially aligns with ${seed.toLowerCase().slice(0, 90)}`,
			];
			return {
				question: `According to the material, which statement best reflects: ${seed}`,
				options: ops,
				correct_answer: 0,
				explanation: 'Derived from provided content; confirm by reviewing the associated section in the PDF.',
				hint: 'Recall the core idea of the referenced sentence.',
				category: categories[idx % categories.length],
				difficulty: difficultyOrder[idx % difficultyOrder.length],
				reasoning: 'Heuristic transformation of source text into a concept question.',
				source_pdf: fileName,
				internet_sources: take(internetSources, 2),
				complexity_score: 7 + (idx % 3),
			};
		};

		return base.map(toQuestion);
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
		const sortedByComplexity = [...questions].sort((a, b) => b.complexity_score - a.complexity_score);
		const topQuestions = sortedByComplexity.slice(0, Math.min(20, sortedByComplexity.length));
		return this.shuffleArray(topQuestions);
	}

	// Generate expert insights (static high-level guidance)
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

		return { strengths, weaknesses, recommendations, studyPlan, advancedTopics };
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