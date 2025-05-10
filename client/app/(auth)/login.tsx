import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useAuthStore } from './../state/auth'

import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import useLoginStore from '../state/userStore'
import Button from './../components/Button/Button'

const MAX_LENGTH = 25

export default function LoginScreen() {
	const { email, password, setEmail, setPassword, resetForm } = useLoginStore()
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, setAuthenticated, checkAuth } = useAuthStore()

	useEffect(() => {
		if (isAuthenticated) {
			router.replace('/(app)')
		}
	}, [isAuthenticated])

	const decodeJWT = (token: string): { userId: string; exp: number } => {
		const base64Url = token.split('.')[1]
		const base64 = base64Url.replace('-', '+').replace('_', '/')
		const decodedData = JSON.parse(atob(base64))
		return decodedData
	}

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('Ошибка', 'Все поля должны быть заполнены')
			return
		}

		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
		if (!emailRegex.test(email)) {
			Alert.alert('Ошибка', 'Неверный формат email')
			return
		}

		setLoading(true)
		try {
			const response = await fetch('http://10.0.2.2:5000/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			})

			const textResponse = await response.text()
			let data
			try {
				data = JSON.parse(textResponse)
				console.log('API Response:', data)
			} catch (jsonError) {
				throw new Error('Ошибка парсинга JSON: ' + jsonError)
			}

			if (!data.accessToken) {
				throw new Error('Токен не получен')
			}

			const decodedToken = decodeJWT(data.accessToken)
			const userId = decodedToken.userId

			if (!userId) {
				throw new Error('Не удалось получить userId из токена')
			}

			await AsyncStorage.setItem('authToken', data.accessToken)
			await AsyncStorage.setItem('userId', userId)
			await AsyncStorage.setItem(
				'tokenExpiration',
				JSON.stringify(decodedToken.exp)
			)

			setAuthenticated(true)
			router.replace('/(app)')

			resetForm()
		} catch (error) {
			console.error('Ошибка запроса (вход):', error)
			Alert.alert('Ошибка')
		} finally {
			setLoading(false)
		}
	}

	return (
		<View style={styles.container}>
			<Image source={require('../../assets/logo.png')} style={styles.logo} />
			<Text style={styles.title}>Вход</Text>
			<TextInput
				placeholder='Email'
				placeholderTextColor='#B19CD9'
				value={email}
				onChangeText={setEmail}
				keyboardType='email-address'
				style={styles.input}
				maxLength={MAX_LENGTH}
			/>
			<TextInput
				placeholder='Пароль'
				placeholderTextColor='#B19CD9'
				value={password}
				onChangeText={setPassword}
				style={styles.input}
				secureTextEntry
				maxLength={MAX_LENGTH}
			/>
			<Button title='Войти' onPress={handleLogin} disabled={loading} />
			{loading && <ActivityIndicator size='large' color='#B19CD9' />}

			<TouchableOpacity
				onPress={() => router.push('/register')}
				style={styles.linkContainer}
			>
				<Text style={styles.linkText}>Нет аккаунта? Зарегистрируйтесь</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#1E1E2E'
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#B19CD9',
		marginBottom: 20
	},
	input: {
		width: '85%',
		padding: 12,
		borderWidth: 2,
		borderColor: '#B19CD9',
		borderRadius: 8,
		backgroundColor: '#2A2A3D',
		color: '#FFFFFF',
		fontSize: 16,
		marginBottom: 16
	},
	linkContainer: {
		marginTop: 20
	},
	linkText: {
		color: '#B19CD9',
		fontSize: 16,
		textDecorationLine: 'underline'
	},
	logo: {
		position: 'absolute',
		top: 20,
		right: 20,
		width: 60,
		height: 60,
		resizeMode: 'contain'
	}
})
