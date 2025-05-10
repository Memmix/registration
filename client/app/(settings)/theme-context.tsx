import { createContext, ReactNode, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
	theme: Theme
	isDark: boolean
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setTheme] = useState<Theme>('dark') // по умолчанию тёмная

	const toggleTheme = () => {
		setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
	}

	const isDark = theme === 'dark'

	return (
		<ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
