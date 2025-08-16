import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { QdrantClient } from '@qdrant/js-client-rest'

export const env = {
	groq: process.env.GROQ_API_KEY || '',
	hf: process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '',
	tavily: process.env.TAVILY_API_KEY || '',
	jina: process.env.JINA_API || process.env.JINA_API_KEY || '',
	qdrantUrl: process.env.QDRANT_URL || 'https://94e50266-acc3-42f8-9692-899609067a1f.us-west-2-0.aws.cloud.qdrant.io:6333',
	qdrantKey: process.env.QDRANT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.88lxjCIWzhtU2cdRs0OCJ0aTkDsVQQJD4iM_R43olKw',
	openai: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '',
}

export function getGroq() {
	return env.groq ? new Groq({ apiKey: env.groq }) : null
}

export function getOpenAI() {
	return env.openai ? new OpenAI({ apiKey: env.openai }) : null
}

export function getQdrant() {
	return new QdrantClient({ url: env.qdrantUrl, apiKey: env.qdrantKey })
}

export async function embedWithJina(texts: string[]): Promise<number[][]> {
	const apiKey = env.jina
	const url = 'https://api.jina.ai/v1/embeddings'
	const model = 'jina-embeddings-v2-base-en'
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({ input: texts, model }),
	})
	if (!res.ok) throw new Error(`Jina embeddings failed: ${res.status}`)
	const json = await res.json()
	return json.data?.map((d: any) => d.embedding) || []
}

export async function tavilySearch(query: string) {
	const res = await fetch('https://api.tavily.com/search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${env.tavily}`,
		},
		body: JSON.stringify({ query, include_domains: ['en.wikipedia.org'], max_results: 3 }),
	})
	if (!res.ok) return []
	const json = await res.json()
	return json.results || []
}