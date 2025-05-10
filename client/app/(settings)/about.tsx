import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { useTheme } from './../(settings)/theme-context' // Подключаем useTheme

export const options = {
	headerShown: false
}

export default function AboutScreen() {
	// Заменили useColorScheme на useTheme
	const { theme } = useTheme() // Теперь получаем тему из контекста
	const isDark = theme === 'dark' // Определяем, темная ли тема

	const styles = getStyles(isDark)

	return (
		<KeyboardAvoidingView
			style={styles.wrapper}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View style={styles.container}>
				<ScrollView contentContainerStyle={styles.scroll}>
					<View style={styles.header}>
						<Feather name='info' size={36} color={styles.accent.color} />
						<Text style={styles.title}>О приложении</Text>
					</View>

					<View style={styles.section}>
						<Text style={styles.subtitle}>Цель приложения</Text>
						<Text style={styles.description}>
							Это приложение помогает вам отслеживать вашу физическую активность
							и тренировки. Вы можете видеть количество шагов, сожжённые
							калории, продолжительность тренировки и многое другое.
						</Text>
					</View>

					<View style={styles.section}>
						<Text style={styles.subtitle}>Особенности</Text>
						<Text style={styles.description}>
							- Отслеживание сожжённых калорий{'\n'}- Доступ к тренировкам и
							статистике{'\n'}- Личное пространство для пользователя{'\n'}-
							Настройки профиля и безопасности
						</Text>
					</View>

					<View style={styles.section}>
						<Text style={styles.subtitle}>Контакты</Text>
						<Text style={styles.description}>
							Если у вас есть вопросы или предложения, вы можете связаться с
							нами по email: support@app.com
						</Text>
					</View>

					<View style={styles.section}>
						<Text style={styles.subtitle}>Версия</Text>
						<Text style={styles.description}>1.0.0</Text>
					</View>
				</ScrollView>

				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push('/')}
				>
					<Text style={styles.buttonText}>Назад</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	)
}

const getStyles = (isDark: boolean) =>
	StyleSheet.create({
		wrapper: {
			flex: 1,
			backgroundColor: isDark ? '#1E1E2E' : '#F2F2F2'
		},
		container: {
			flex: 1,
			justifyContent: 'space-between',
			paddingBottom: 90
		},
		scroll: {
			padding: 20,
			paddingBottom: 40
		},
		header: {
			alignItems: 'center',
			marginBottom: 30
		},
		title: {
			fontSize: 24,
			fontWeight: 'bold',
			color: isDark ? '#fff' : '#000',
			marginTop: 10
		},
		section: {
			backgroundColor: isDark ? '#2A2A40' : '#E0E0E0',
			borderRadius: 16,
			paddingVertical: 16,
			paddingHorizontal: 20,
			marginBottom: 20
		},
		subtitle: {
			color: isDark ? '#B19CD9' : '#007AFF',
			fontSize: 18,
			fontWeight: 'bold',
			marginBottom: 10
		},
		description: {
			color: isDark ? '#fff' : '#000',
			fontSize: 14,
			lineHeight: 22
		},
		button: {
			backgroundColor: isDark ? '#B19CD9' : '#007AFF',
			paddingVertical: 14,
			paddingHorizontal: 50,
			borderRadius: 30,
			position: 'absolute',
			bottom: 20,
			left: '10%',
			right: '10%'
		},
		buttonText: {
			color: 'white',
			fontSize: 16,
			fontWeight: 'bold',
			textAlign: 'center'
		},
		accent: {
			color: isDark ? '#B19CD9' : '#007AFF'
		}
	})
