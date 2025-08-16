import { supabase } from '@/lib/supabase'
import { expertAIProcessor } from '@/lib/expert-ai-processor'

let trainerStarted = false
let trainerInterval: number | null = null

async function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms))
}

async function listPdfFiles(): Promise<string[]> {
	const { data, error } = await supabase.storage.from('pdfs').list('', { limit: 100 })
	if (error) {
		console.error('Trainer: failed to list PDFs', error)
		return []
	}
	return (data || []).filter((f: any) => !f.name.endsWith('/')).map((f: any) => f.name)
}

async function downloadPdf(name: string): Promise<ArrayBuffer | null> {
	try {
		const { data, error } = await supabase.storage.from('pdfs').download(name)
		if (error || !data) return null
		return await data.arrayBuffer()
	} catch (e) {
		console.error('Trainer: download error', e)
		return null
	}
}

async function fetchExistingQuestionsBySource(source_pdf: string): Promise<Set<string>> {
	try {
		const { data, error } = await supabase
			.from('questions')
			.select('question')
			.eq('source_pdf', source_pdf)
			.limit(2000)
		if (error) return new Set<string>()
		return new Set((data || []).map((r: any) => r.question))
	} catch {
		return new Set<string>()
	}
}

async function insertQuestions(rows: any[]) {
	if (!rows.length) return
	try {
		const { error } = await supabase.from('questions').insert(rows)
		if (error) console.error('Trainer: insert error', error)
	} catch (e) {
		console.error('Trainer: insert exception', e)
	}
}

async function runOnce() {
	try {
		const files = await listPdfFiles()
		for (const file of files) {
			const buf = await downloadPdf(file)
			if (!buf) continue
			const content = await expertAIProcessor.extractContent(buf)
			const { questions } = await expertAIProcessor.generateExpertQuestions(content, file)

			const existing = await fetchExistingQuestionsBySource(file)
			const fresh = questions.filter((q) => !existing.has(q.question)).map((q) => ({
				question: q.question,
				options: q.options,
				correct_answer: q.correct_answer,
				explanation: q.explanation,
				hint: q.hint,
				category: q.category,
				difficulty: q.difficulty === 'Expert' ? 'Easy' : q.difficulty === 'Master' ? 'Medium' : 'Hard',
				source_pdf: q.source_pdf,
			}))
			await insertQuestions(fresh)
			// Respect API limits
			await sleep(1000)
		}
	} catch (e) {
		console.error('Trainer: runOnce error', e)
	}
}

export function startBackgroundTrainer() {
	// Disabled by default to keep UI responsive; backend agent handles continuous gen
	return
}

export function stopBackgroundTrainer() {
	if (trainerInterval) {
		clearInterval(trainerInterval)
		trainerInterval = null
	}
	trainerStarted = false
}