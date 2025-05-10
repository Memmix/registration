import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

type AuthStore = {
	isAuthenticated: boolean
	setAuthenticated: (value: boolean) => void
	checkAuth: () => Promise<void>
	logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>(set => ({
	isAuthenticated: false,
	setAuthenticated: value => set({ isAuthenticated: value }),
	checkAuth: async () => {
		const token = await AsyncStorage.getItem('authToken')
		set({ isAuthenticated: !!token })
	},
	logout: async () => {
		await AsyncStorage.removeItem('authToken')
		await AsyncStorage.removeItem('userId')
		await AsyncStorage.removeItem('tokenExpiration')
		set({ isAuthenticated: false })
	}
}))
