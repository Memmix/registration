import { router } from 'expo-router'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
export default function StartScreen() {
	return (
		<View style={styles.container}>
			<Image source={require('../../assets/logo.png')} style={styles.logo} />
			<Text style={styles.halo}>
				Алоха, ребята! 👋
				{'\n\n'}
				LiveFit — это новейшее приложение для домашних тренировок и уличных
				прогулок.
				{'\n\n'}
				Составляй персональные планы тренировок, отслеживай прогресс и оставайся
				в форме даже дома.
				{'\n\n'}
				Следи за своими шагами, маршрутом и активностью на свежем воздухе.
				{'\n\n'}
				Подходит как для новичков, так и для опытных спортсменов.
				{'\n\n'}
				Присоединяйся к LiveFit — сделай первый шаг к здоровому образу жизни уже
				сегодня!
			</Text>
			<TouchableOpacity
				onPress={() => router.push('/login')}
				style={styles.button}
			>
				<Text style={styles.buttonText}>Начать</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#1E1E2E',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 30
	},
	logo: {
		width: 150,
		height: 150,
		marginBottom: 30,
		resizeMode: 'contain'
	},
	halo: {
		color: 'white',
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 40,
		lineHeight: 24
	},
	button: {
		backgroundColor: '#FF6B6B',
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 25
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold'
	}
})
