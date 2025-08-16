import 'dotenv/config'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'
import { QdrantClient } from '@qdrant/js-client-rest'
import { embedWithJina, tavilySearch } from './providers'

// Config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || ''
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const STORAGE_BUCKET = process.env.AGENT_STORAGE_BUCKET || 'pdfs'
const INTERVAL_MS = Number(process.env.AGENT_INTERVAL_MS || 10 * 60 * 1000) // default 10min
const MAX_FILES = Number(process.env.AGENT_MAX_FILES || 50)
const MAX_QUESTIONS_PER_FILE = Number(process.env.AGENT_MAX_QUESTIONS_PER_FILE || 48)
const QDRANT_URL = process.env.QDRANT_URL || 'https://94e50266-acc3-42f8-9692-899609067a1f.us-west-2-0.aws.cloud.qdrant.io:6333'
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.88lxjCIWzhtU2cdRs0OCJ0aTkDsVQQJD4iM_R43olKw'
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'istqb_questions'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.error('Agent: Missing Supabase credentials in env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null
const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY })

function sleep(ms: number) {
	return new Promise((res) => setTimeout(res, ms))
}

async function ensureCollection() {
	try {
		await qdrant.getCollection(QDRANT_COLLECTION)
	} catch {
		await qdrant.createCollection(QDRANT_COLLECTION, { vectors: { size: 768, distance: 'Cosine' } })
	}
}

async function listPdfFiles(): Promise<string[]> {
	const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list('', { limit: MAX_FILES })
	if (error) {
		console.error('Agent: list error', error)
		return []
	}
	return (data || []).filter((f: any) => !f.name.endsWith('/')).map((f: any) => f.name)
}

async function downloadPdf(name: string): Promise<Buffer | null> {
	try {
		const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(name)
		if (error || !data) return null
		const arrayBuffer = await (data as any).arrayBuffer()
		return Buffer.from(arrayBuffer)
	} catch (e) {
		console.error('Agent: download error', e)
		return null
	}
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
	try {
		const parsed = await pdfParse(buffer)
		return (parsed.text || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim()
	} catch (e) {
		console.error('Agent: pdf parse error', e)
		return ''
	}
}

function computeDifficultyDistribution(text: string): { expert: number; master: number; champion: number } {
	const lc = text.toLowerCase()
	const counts = {
		easy: (lc.match(/\beasy\b/g) || []).length,
		medium: (lc.match(/\bmedium\b/g) || []).length,
		hard: (lc.match(/\bhard\b/g) || []).length,
		expert: (lc.match(/\bexpert\b/g) || []).length,
		master: (lc.match(/\bmaster\b/g) || []).length,
		champion: (lc.match(/\bchampion\b/g) || []).length,
	}
	const total = 36
	const baseExpert = counts.easy + counts.expert + 1
	const baseMaster = counts.medium + counts.master + 1
	const baseChampion = counts.hard + counts.champion + 1
	const sum = baseExpert + baseMaster + baseChampion
	return {
		expert: Math.max(8, Math.round((baseExpert / sum) * total)),
		master: Math.max(8, Math.round((baseMaster / sum) * total)),
		champion: Math.max(8, Math.round((baseChampion / sum) * total)),
	}
}

function sanitizeQuestionArray(raw: any[], sourcePdf: string): any[] {
	return (raw || [])
		.filter((q: any) => q && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length >= 4)
		.map((q: any) => ({
			question: String(q.question),
			options: q.options.slice(0, 4).map((o: any) => String(o)),
			correct_answer: Math.max(0, Math.min(3, Number(q.correct_answer) ?? 0)),
			explanation: String(q.explanation || ''),
			hint: String(q.hint || ''),
			category: String(q.category || 'ISTQB'),
			difficulty: ['Expert', 'Master', 'Champion'].includes(q.difficulty) ? q.difficulty : 'Expert',
			reasoning: String(q.reasoning || ''),
			complexity_score: Math.max(6, Math.min(10, Number(q.complexity_score) || 7)),
			source_pdf: sourcePdf,
		}))
}

function extractJsonArray(text: string): any[] | null {
	try {
		const start = text.indexOf('[')
		const end = text.lastIndexOf(']')
		if (start === -1 || end === -1 || end <= start) return null
		return JSON.parse(text.slice(start, end + 1))
	} catch {
		return null
	}
}

async function retrievalSnippets(text: string) {
	const query = 'ISTQB certification topics core definitions'
	const results = await tavilySearch(query)
	const snippets = (results || []).map((r: any) => `${r.title}: ${r.content}`).slice(0, 3).join('\n')
	return snippets
}

async function generateQuestionsWithGroq(text: string, fileName: string, target: { expert: number; master: number; champion: number }): Promise<any[]> {
	if (!groq) return []
	const total = target.expert + target.master + target.champion
	const retrieval = await retrievalSnippets(text)
	const prompt = `You are an expert ISTQB instructor. Create ${total} multiple-choice questions strictly from the PDF content and the retrieval snippets. Difficulty distribution: Expert ${target.expert}, Master ${target.master}, Champion ${target.champion}. Each question has exactly 4 options and one correct_answer (0-3). Output ONLY a JSON array with objects having keys: question, options, correct_answer, explanation, hint, category, difficulty (Expert|Master|Champion), reasoning, complexity_score (1-10).`
	const user = `PDF Content (trimmed):\n${text.slice(0, 16000)}\n\nRetrieval:\n${retrieval}`
	const resp = await groq.chat.completions.create({
		model: 'llama-3.1-70b-versatile',
		messages: [
			{ role: 'system', content: 'You write high-quality ISTQB exam questions with rigorous explanations.' },
			{ role: 'user', content: `${prompt}\n\n${user}` },
		],
		temperature: 0.5,
		max_tokens: 6000,
	})
	const content = resp.choices?.[0]?.message?.content || ''
	const array = extractJsonArray(content) || []
	return sanitizeQuestionArray(array, fileName)
}

async function generateQuestionsWithOpenAI(text: string, fileName: string, target: { expert: number; master: number; champion: number }): Promise<any[]> {
	if (!openai) return []
	const total = target.expert + target.master + target.champion
	const prompt = `You are an expert ISTQB instructor. Create ${total} multiple-choice questions strictly from the provided content. Difficulty distribution: Expert ${target.expert}, Master ${target.master}, Champion ${target.champion}. Each question must have exactly 4 options and one correct_answer (0-3). Output ONLY a JSON array with objects having keys: question, options, correct_answer, explanation, hint, category, difficulty (Expert|Master|Champion), reasoning, complexity_score (1-10).`
	const user = `PDF Content (trimmed):\n${text.slice(0, 16000)}`
	const resp = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'You write high-quality ISTQB exam questions with rigorous explanations.' },
			{ role: 'user', content: `${prompt}\n\n${user}` },
		],
		temperature: 0.5,
		max_tokens: 6000,
	})
	const content = resp.choices?.[0]?.message?.content || ''
	const array = extractJsonArray(content) || []
	return sanitizeQuestionArray(array, fileName)
}

function heuristicQuestions(text: string, fileName: string, target: { expert: number; master: number; champion: number }): any[] {
	const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 40 && s.length < 240)
	const difficulties: Array<'Expert'|'Master'|'Champion'> = []
	for (let i = 0; i < target.expert; i++) difficulties.push('Expert')
	for (let i = 0; i < target.master; i++) difficulties.push('Master')
	for (let i = 0; i < target.champion; i++) difficulties.push('Champion')
	const take = Math.min(sentences.length, difficulties.length)
	const out: any[] = []
	for (let i = 0; i < take; i++) {
		const s = sentences[i]
		const difficulty = difficulties[i]
		out.push({
			question: `Which option best reflects the statement: ${s}`,
			options: [
				`Directly supports: ${s.slice(0, 90)}`,
				`Contradicts: ${s.slice(0, 90)}`,
				`Irrelevant to: ${s.slice(0, 90)}`,
				`Partially supports: ${s.slice(0, 90)}`,
			],
			correct_answer: 0,
			explanation: 'Derived from source content; validate against the PDF.',
			hint: 'Recall the key phrase of the statement.',
			category: 'ISTQB',
			difficulty,
			reasoning: 'Heuristic conversion from statement to concept question.',
			complexity_score: difficulty === 'Champion' ? 9 : difficulty === 'Master' ? 8 : 7,
			source_pdf: fileName,
		})
	}
	return out
}

async function fetchExistingQuestionsMapBySource(source_pdf: string): Promise<Set<string>> {
	try {
		const { data, error } = await supabase.from('questions').select('question').eq('source_pdf', source_pdf).limit(5000)
		if (error) return new Set<string>()
		return new Set((data || []).map((r: any) => r.question))
	} catch {
		return new Set<string>()
	}
}

async function upsertEmbeddingsToQdrant(questions: any[]) {
	if (!questions.length) return
	const texts = questions.map((q) => `${q.question}\n${(q.options || []).join(' ')}`)
	const vectors = await embedWithJina(texts)
	const points = questions.map((q, i) => ({
		id: `${q.source_pdf}:${Buffer.from(q.question).toString('base64')}`,
		vector: vectors[i],
		payload: {
			question: q.question,
			category: q.category,
			difficulty: q.difficulty,
			source_pdf: q.source_pdf,
		},
	}))
	await qdrant.upsert(QDRANT_COLLECTION, { wait: true, points })
}

async function insertQuestions(rows: any[]) {
	if (!rows.length) return
	const payload = rows.map((q) => ({
		question: q.question,
		options: q.options,
		correct_answer: q.correct_answer,
		explanation: q.explanation,
		hint: q.hint,
		category: q.category,
		difficulty: q.difficulty === 'Expert' ? 'Easy' : q.difficulty === 'Master' ? 'Medium' : 'Hard',
		source_pdf: q.source_pdf,
	}))
	const { error } = await supabase.from('questions').insert(payload)
	if (error) console.error('Agent: insert error', error)
}

async function processFile(fileName: string) {
	console.log(`[Agent] Processing ${fileName}`)
	const buf = await downloadPdf(fileName)
	if (!buf) return
	const text = await extractTextFromPdf(buf)
	if (!text) return
	const target = computeDifficultyDistribution(text)
	const totalTarget = Math.min(MAX_QUESTIONS_PER_FILE, target.expert + target.master + target.champion)
	const scale = totalTarget / (target.expert + target.master + target.champion)
	target.expert = Math.max(4, Math.floor(target.expert * scale))
	target.master = Math.max(4, Math.floor(target.master * scale))
	target.champion = Math.max(4, Math.floor(target.champion * scale))

	let questions: any[] = []
	if (groq) {
		try {
			questions = await generateQuestionsWithGroq(text, fileName, target)
		} catch (e) {
			console.error('Agent: Groq generation failed, trying OpenAI', e)
		}
	}
	if (!questions.length && openai) {
		try {
			questions = await generateQuestionsWithOpenAI(text, fileName, target)
		} catch (e) {
			console.error('Agent: OpenAI generation failed, falling back', e)
		}
	}
	if (!questions.length) {
		questions = heuristicQuestions(text, fileName, target)
	}

	const existing = await fetchExistingQuestionsMapBySource(fileName)
	const fresh = questions.filter((q) => !existing.has(q.question))
	await insertQuestions(fresh)
	await upsertEmbeddingsToQdrant(fresh)
	console.log(`[Agent] ${fileName}: added ${fresh.length} new questions`)
}

async function runOnce() {
	try {
		await ensureCollection()
		const files = await listPdfFiles()
		for (const f of files) {
			await processFile(f)
			await sleep(1500)
		}
	} catch (e) {
		console.error('Agent: runOnce error', e)
	}
}

async function mainLoop() {
	console.log(`[Agent] Starting. Interval ${INTERVAL_MS} ms. Bucket ${STORAGE_BUCKET}`)
	for (;;) {
		await runOnce()
		await sleep(INTERVAL_MS)
	}
}

mainLoop().catch((e) => {
	console.error('Agent: fatal error', e)
	process.exit(1)
})