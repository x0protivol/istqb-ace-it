import { useState } from 'react'

// Minimal types
interface Question {
	question: string
	options: string[]
	correct: number
}

async function extractPdfText(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer()
	const pdfjsLib: any = await import('pdfjs-dist/legacy/build/pdf')
	// Use fallback worker if needed (no explicit worker configuration)
	const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
	const pdf = await loadingTask.promise
	let text = ''
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i)
		const content = await page.getTextContent()
		const pageText = content.items.map((it: any) => (typeof it.str === 'string' ? it.str : '')).join(' ')
		text += '\n' + pageText
	}
	return text.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim()
}

function makeQuestions(text: string, count = 20): Question[] {
	const sentences = text
		.split(/(?<=[.!?])\s+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 40 && s.length < 220)

	const chosen = sentences.slice(0, count)
	return chosen.map((s, i) => {
		const base = s.slice(0, 90)
		const opts = [
			`Directly supports: ${base}`,
			`Contradicts: ${base}`,
			`Irrelevant to: ${base}`,
			`Partially supports: ${base}`,
		]
		return {
			question: `Which option best reflects the statement: ${s}`,
			options: opts,
			correct: 0,
		}
	})
}

export default function App() {
	const [pdfName, setPdfName] = useState<string>('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>('')
	const [questions, setQuestions] = useState<Question[]>([])
	const [started, setStarted] = useState(false)
	const [index, setIndex] = useState(0)
	const [answers, setAnswers] = useState<number[]>([])
	const [finished, setFinished] = useState(false)

	const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		if (file.type !== 'application/pdf') {
			setError('Please upload a PDF')
			return
		}
		setError('')
		setStarted(false)
		setFinished(false)
		setQuestions([])
		setAnswers([])
		setIndex(0)
		setPdfName(file.name)
		setLoading(true)
		try {
			const text = await extractPdfText(file)
			const qs = makeQuestions(text, 20)
			setQuestions(qs)
			setAnswers(Array(qs.length).fill(-1))
		} catch (err: any) {
			setError('Failed to process PDF. Try another file.')
		} finally {
			setLoading(false)
		}
	}

	const start = () => {
		if (questions.length === 0) return
		setStarted(true)
		setFinished(false)
		setIndex(0)
	}

	const select = (i: number) => {
		const next = answers.slice()
		next[index] = i
		setAnswers(next)
	}

	const nextQ = () => {
		if (index < questions.length - 1) setIndex(index + 1)
	}

	const prevQ = () => {
		if (index > 0) setIndex(index - 1)
	}

	const finish = () => {
		setFinished(true)
		setStarted(false)
	}

	const score = answers.reduce((acc, a, i) => acc + (a === questions[i]?.correct ? 1 : 0), 0)

	return (
		<div style={{ minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
			<h1 style={{ fontSize: 24, marginBottom: 8 }}>ISTQB PDF → Quiz</h1>
			<p style={{ color: '#666', marginBottom: 16 }}>Upload your ISTQB PDF; we will extract text and generate a quick practice quiz.</p>

			<div style={{ marginBottom: 16 }}>
				<input type="file" accept="application/pdf" onChange={onFile} />
			</div>

			{loading && <div>Processing PDF… This may take a moment.</div>}
			{error && <div style={{ color: 'red' }}>{error}</div>}

			{!loading && questions.length > 0 && !started && !finished && (
				<div style={{ marginTop: 12 }}>
					<div>Ready with {questions.length} questions from: <strong>{pdfName}</strong></div>
					<button onClick={start} style={{ marginTop: 8, padding: '8px 12px' }}>Start Quiz</button>
				</div>
			)}

			{started && questions.length > 0 && (
				<div style={{ marginTop: 16, maxWidth: 900 }}>
					<div style={{ marginBottom: 8 }}>Question {index + 1} / {questions.length}</div>
					<div style={{ fontWeight: 600, marginBottom: 12 }}>{questions[index].question}</div>
					<div style={{ display: 'grid', gap: 8 }}>
						{questions[index].options.map((opt, i) => (
							<button
								key={i}
								onClick={() => select(i)}
								style={{
									textAlign: 'left',
									padding: '10px 12px',
									border: answers[index] === i ? '2px solid #2563eb' : '1px solid #ddd',
									borderRadius: 6,
									background: answers[index] === i ? '#eff6ff' : '#fff',
								}}
							>{String.fromCharCode(65 + i)}. {opt}</button>
						))}
					</div>
					<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
						<button onClick={prevQ} disabled={index === 0}>Previous</button>
						{index < questions.length - 1 ? (
							<button onClick={nextQ} disabled={answers[index] === -1}>Next</button>
						) : (
							<button onClick={finish} disabled={answers.some(a => a === -1)}>Finish</button>
						)}
					</div>
				</div>
			)}

			{finished && (
				<div style={{ marginTop: 16 }}>
					<h2>Results</h2>
					<div style={{ marginBottom: 8 }}>Score: {score} / {questions.length}</div>
					<button onClick={() => { setFinished(false); setStarted(true); setIndex(0); }}>Review</button>
				</div>
			)}
		</div>
	)
}
