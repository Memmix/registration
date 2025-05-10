import { StyleSheet } from 'react-native'
import { useTheme } from './(settings)/theme-context'

const lightColors = {
	background: '#FFFFFF',
	card: '#F0F0F0',
	text: '#1C1C1C',
	subtext: '#555555',
	accent: '#007AFF',
	blue: '#007AFF',
	red: '#FF3B30',
	yellow: '#FFCC00',
	green: '#34C759'
}

const darkColors = {
	background: '#1E1E2E',
	card: '#2A2A40',
	text: '#FFFFFF',
	subtext: '#B19CD9',
	accent: '#B19CD9',
	blue: '#5AC8FA',
	red: '#FF453A',
	yellow: '#FFD60A',
	green: '#30D158'
}

export const useThemedStyles = () => {
	const { theme } = useTheme()
	const isDark = theme === 'dark'
	const themeColors = theme === 'dark' ? darkColors : lightColors

	const themedStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: themeColors.background,
			alignItems: 'center',
			paddingHorizontal: 16 // added padding for horizontal spacing
		},
		content: {
			padding: 20,
			paddingTop: 60,
			alignItems: 'center'
		},
		text: {
			color: themeColors.text,
			fontSize: 16
		},
		subtext: {
			color: themeColors.subtext,
			fontSize: 14
		},
		card: {
			backgroundColor: themeColors.card,
			borderRadius: 16,
			padding: 20,
			width: '100%',
			marginBottom: 15 // Added margin between cards
		},
		button: {
			backgroundColor: themeColors.accent,
			padding: 16,
			borderRadius: 30,
			alignItems: 'center',
			marginTop: 20
		},
		buttonText: {
			color: '#FFFFFF',
			fontWeight: 'bold',
			fontSize: 16
		},
		greeting: {
			fontSize: 24,
			fontWeight: 'bold',
			color: themeColors.text,
			marginBottom: 20
		},
		statsContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			width: '100%',
			marginBottom: 20
		},
		statCard: {
			backgroundColor: themeColors.card,
			padding: 16,
			borderRadius: 12,
			alignItems: 'center',
			flex: 1,
			marginHorizontal: 5
		},
		statValue: {
			fontSize: 20,
			fontWeight: 'bold',
			color: themeColors.text
		},
		statLabel: {
			fontSize: 14,
			color: themeColors.subtext
		},
		section: {
			width: '100%',
			paddingHorizontal: 20,
			marginTop: 20
		},
		sectionTitle: {
			fontSize: 18,
			fontWeight: '600',
			color: themeColors.text
		},
		workoutCard: {
			backgroundColor: themeColors.card,
			padding: 16,
			borderRadius: 16,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginVertical: 20
		},
		cardTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			color: themeColors.text
		},
		cardSubtitle: {
			fontSize: 14,
			color: themeColors.subtext
		},
		cardButton: {
			backgroundColor: themeColors.accent,
			padding: 12,
			borderRadius: 30
		},
		statsBox: {
			width: '100%',
			backgroundColor: isDark ? '#2A2A40' : '#E0E0E0',
			borderRadius: 16,
			padding: 20,
			marginBottom: 30
		},
		statsTitle: {
			fontSize: 18,
			fontWeight: 'bold',
			color: isDark ? '#fff' : '#000',
			marginBottom: 12
		},
		statText: {
			fontSize: 14,
			color: isDark ? '#ccc' : '#333',
			marginBottom: 6
		},
		progressBarBackground: {
			width: '100%',
			height: 10,
			backgroundColor: isDark ? '#444' : '#ccc',
			borderRadius: 5,
			marginTop: 10
		},
		progressBarFill: {
			height: 10,
			backgroundColor: isDark ? '#B19CD9' : '#007AFF',
			borderRadius: 5
		},
		tableContainer: {
			width: '100%',
			marginVertical: 20
		},
		tableTitle: {
			fontSize: 20,
			fontWeight: 'bold',
			color: themeColors.text,
			marginBottom: 10
		},
		tableRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			backgroundColor: themeColors.card,
			padding: 12,
			borderRadius: 10,
			marginBottom: 10
		},
		tableCell: {
			fontSize: 11,
			color: themeColors.text,
			flex: 1,
			textAlign: 'center'
		},
		greetingContainer: {
			paddingVertical: 20,
			justifyContent: 'center',
			alignItems: 'center'
		},
		title: {
			color: themeColors.text,
			fontSize: 22,
			textAlign: 'center',
			marginBottom: 20
		},
		input: {
			width: '80%',
			borderColor: themeColors.accent,
			borderWidth: 1,
			borderRadius: 10,
			padding: 12,
			color: themeColors.text,
			fontSize: 18,
			marginBottom: 20
		},
		headerRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			marginBottom: 16
		},
		resetButton: {
			backgroundColor: themeColors.accent,
			paddingVertical: 6,
			paddingHorizontal: 12,
			borderRadius: 8
		},
		resetButtonText: {
			color: themeColors.background,
			fontWeight: 'bold'
		},
		flatListContent: {
			alignItems: 'flex-start',
			paddingTop: 10
		},
		dayCard: {
			backgroundColor: themeColors.card,
			borderRadius: 16,
			padding: 20,
			marginHorizontal: 10,
			alignItems: 'center',
			justifyContent: 'space-between',
			height: 250,
			marginBottom: 15 // Add spacing between each day card
		},
		dayLabel: {
			color: themeColors.subtext,
			fontSize: 18,
			marginBottom: 10,
			textAlign: 'center'
		},
		setsRow: {
			flexDirection: 'row',
			justifyContent: 'center',
			flexWrap: 'wrap',
			marginBottom: 20,
			gap: 6
		},
		loaderContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: 100
		},
		setText: {
			color: themeColors.text,
			fontSize: 22,
			fontWeight: '600',
			marginHorizontal: 6
		},
		startButton: {
			backgroundColor: themeColors.accent,
			paddingVertical: 10,
			paddingHorizontal: 20,
			borderRadius: 10,
			marginTop: 10
		},
		startButtonText: {
			color: themeColors.background,
			fontSize: 18,
			fontWeight: 'bold'
		},
		exerciseGif: {
			width: '100%',
			height: 200,
			marginBottom: 20
		},
		fixedBackButton: {
			position: 'absolute',
			bottom: 30,
			left: 0,
			right: 0,
			alignItems: 'center'
		}
	})

	return { styles: themedStyles, colors: themeColors }
}
