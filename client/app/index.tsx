import AsyncStorage from '@react-native-async-storage/async-storage'
import { Redirect } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { isAuthenticatedAtom } from './state/auth'

export default function Index() {
	const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = await AsyncStorage.getItem('authToken')
				setIsAuthenticated(!!token)
			} catch (err) {
				console.error('Ошибка при проверке аутентификации')
				setIsAuthenticated(false)
			} finally {
				setIsLoading(false)
			}
		}

		checkAuth()
	}, [])

	if (isLoading) {
		return null
	}

	if (isAuthenticated) {
		return <Redirect href='/(app)' />
	} else {
		return <Redirect href='/(auth)/login' />
	}
}
