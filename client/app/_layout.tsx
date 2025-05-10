import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { ThemeProvider } from './(settings)/theme-context'
import { useAuthStore } from './state/auth'
export default function RootLayout() {
	const { isAuthenticated, checkAuth } = useAuthStore()

	useEffect(() => {
		checkAuth()
	}, [])

	return (
		<ThemeProvider>
			<Stack>
				<Stack.Screen name='(workout)' options={{ headerShown: false }} />
				<Stack.Screen name='(settings)' options={{ headerShown: false }} />
				<Stack.Screen
					name={isAuthenticated ? '(app)' : '(auth)'}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name='+not-found'
					options={{ title: 'Not Found', headerShown: false }}
				/>
			</Stack>
		</ThemeProvider>
	)
}
