import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const useQuestionsCount = () => {
	const [count, setCount] = useState<number>(0)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true
		;(async () => {
			try {
				setLoading(true)
				const { count: c } = await supabase.from('questions').select('*', { count: 'exact', head: true })
				if (mounted) setCount(c || 0)
			} catch (e) {
				if (mounted) setCount(0)
			} finally {
				if (mounted) setLoading(false)
			}
		})()
		return () => { mounted = false }
	}, [])

	return { count, loading }
}