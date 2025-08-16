// Advanced PDF Content Analyzer with Intelligent Question Generation

// PDF.js for real PDF text extraction
let pdfjsLib: any = null;
let pdfWorkerConfigured = false;

async function ensurePdfJs() {
	if (!pdfjsLib) {
		pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
	}
	if (!pdfWorkerConfigured && pdfjsLib) {
		try {
			pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/legacy/build/pdf.worker.min.js';
			pdfWorkerConfigured = true;
		} catch (_) {}
	}
}

export interface ProcessedQuestion {
	question: string;
	options: string[];
	correct_answer: number;
	explanation: string;
	hint: string;
	category: string;
	difficulty: 'Easy' | 'Medium' | 'Hard';
	reasoning: string;
	source_pdf: string;
}

export interface ProcessingSummary {
	total_questions: number;
	easy_count: number;
	medium_count: number;
	hard_count: number;
	topics_covered: string[];
	estimated_exam_time: number;
	recommended_pass_score: number;
}

export interface ProcessingResult {
	questions: ProcessedQuestion[];
	summary: ProcessingSummary;
}

// Intelligent Question Templates for ISTQB (kept for type alignment but unused)
const questionTemplates = {
	easy: [],
	medium: [],
	hard: []
};

// Advanced PDF Content Analyzer
export class AdvancedPDFProcessor {
	// Extract and clean PDF content
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
			return fullText.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
		} catch (error) {
			console.error('PDF extraction error:', error);
			throw new Error('Failed to extract PDF content');
		}
	}

	// Analyze content and generate intelligent questions (heuristic only)
	async generateQuestions(content: string, fileName: string): Promise<ProcessingResult> {
		try {
			const sentences = content
				.split(/(?<=[.!?])\s+/)
				.map((s) => s.trim())
				.filter((s) => s.length > 30 && s.length < 280);

			const categories = ['Fundamentals of Testing', 'Testing Principles', 'Test Design Techniques', 'Test Levels', 'Test Types', 'Test Management'];
			const difficulties: Array<ProcessedQuestion['difficulty']> = ['Easy', 'Medium', 'Hard'];

			const questions = sentences.slice(0, 30).map((s, idx) => {
				const opts = [
					`Directly supports: ${s.slice(0, 80)}`,
					`Contradicts: ${s.slice(0, 80)}`,
					`Irrelevant to: ${s.slice(0, 80)}`,
					`Partially supports: ${s.slice(0, 80)}`,
				];
				return {
					question: `Which option best reflects the statement: ${s}`,
					options: opts,
					correct_answer: 0,
					explanation: 'Derived from source content; validate against the PDF.',
					hint: 'Recall the key phrase of the statement.',
					category: categories[idx % categories.length],
					difficulty: difficulties[idx % difficulties.length],
					reasoning: 'Heuristic transformation of content to question.',
					source_pdf: fileName,
				};
			});

			const summary: ProcessingSummary = {
				total_questions: questions.length,
				easy_count: questions.filter(q => q.difficulty === 'Easy').length,
				medium_count: questions.filter(q => q.difficulty === 'Medium').length,
				hard_count: questions.filter(q => q.difficulty === 'Hard').length,
				topics_covered: categories,
				estimated_exam_time: questions.length * 60,
				recommended_pass_score: 75,
			};

			return { questions, summary };
		} catch (error) {
			console.error('Question generation error:', error);
			throw new Error('Failed to generate questions from content');
		}
	}

	// Create intelligent test sets
	async createTestSets(questions: ProcessedQuestion[]): Promise<{
		easy: ProcessedQuestion[];
		medium: ProcessedQuestion[];
		hard: ProcessedQuestion[];
		mixed: ProcessedQuestion[];
	}> {
		const easy = questions.filter(q => q.difficulty === 'Easy');
		const medium = questions.filter(q => q.difficulty === 'Medium');
		const hard = questions.filter(q => q.difficulty === 'Hard');
		const mixed = this.createBalancedTest(questions);
		return { easy, medium, hard, mixed };
	}

	// Create balanced test with intelligent question selection
	private createBalancedTest(questions: ProcessedQuestion[]): ProcessedQuestion[] {
		const easy = questions.filter(q => q.difficulty === 'Easy');
		const medium = questions.filter(q => q.difficulty === 'Medium');
		const hard = questions.filter(q => q.difficulty === 'Hard');
		const selectedEasy = this.shuffleArray(easy).slice(0, Math.min(8, easy.length));
		const selectedMedium = this.shuffleArray(medium).slice(0, Math.min(12, medium.length));
		const selectedHard = this.shuffleArray(hard).slice(0, Math.min(10, hard.length));
		return this.shuffleArray([...selectedEasy, ...selectedMedium, ...selectedHard]);
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

	// Generate insights and recommendations
	async generateInsights(questions: ProcessedQuestion[]): Promise<{
		strengths: string[];
		weaknesses: string[];
		recommendations: string[];
		studyPlan: string[];
	}> {
		try {
			const strengths = [
				'Content processed successfully',
				'Balanced difficulty distribution',
				'Wide topic coverage',
			];

			const weaknesses = [
				'Heuristic questions may be less nuanced than AI-generated ones',
			];

			const recommendations = [
				'Focus on weak areas identified in practice tests',
				'Review ISTQB syllabus sections thoroughly',
			];

			const studyPlan = [
				'Week 1: Fundamentals of Testing and Testing Principles',
				'Week 2: Test Design Techniques and Test Levels',
				'Week 3: Test Management and Tool Support',
				'Week 4: Practice exams and review weak areas',
			];

			return { strengths, weaknesses, recommendations, studyPlan };
		} catch (error) {
			console.error('Insights generation error:', error);
			return {
				strengths: ['Content processed successfully'],
				weaknesses: ['Analysis limited'],
				recommendations: ['Review all questions carefully'],
				studyPlan: ['Study systematically'],
			};
		}
	}
}

// Export singleton instance
export const pdfProcessor = new AdvancedPDFProcessor(); 