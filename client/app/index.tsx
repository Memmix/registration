import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { useAuthStore } from './state/auth'

export default function Index() {
	const { isAuthenticated, checkAuth } = useAuthStore()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const initialize = async () => {
			await checkAuth()
			setIsLoading(false)
		}
		initialize()
	}, [])

	if (isLoading) {
		return null
	}

	return <Redirect href={isAuthenticated ? '/(app)' : '/(auth)/start'} />
}
