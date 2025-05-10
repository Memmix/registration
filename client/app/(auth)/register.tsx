import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
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
import { useAuthStore } from '../state/auth'
import useRegisterStore from '../state/userStore'
import Button from './../components/Button/Button'
const MAX_LENGTH = 25
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterScreen() {
	const {
		name,
		email,
		password,
		confirmPassword,
		setName,
		setEmail,
		setPassword,
		setConfirmPassword,
		resetForm
	} = useRegisterStore()
	const decodeJWT = (token: string): { userId: string; exp: number } => {
		const base64Url = token.split('.')[1]
		const base64 = base64Url.replace('-', '+').replace('_', '/')
		const decodedData = JSON.parse(atob(base64))
		return decodedData
	}
	const [loading, setLoading] = useState(false)
	const { isAuthenticated, setAuthenticated, checkAuth } = useAuthStore()

	useEffect(() => {
		if (isAuthenticated) {
			router.replace('/(app)')
		}
	}, [isAuthenticated])

	const handleRegister = async () => {
		if (!name || !email || !password || !confirmPassword) {
			Alert.alert('Ошибка', 'Все поля должны быть заполнены')
			return
		}
		if (!emailRegex.test(email)) {
			Alert.alert('Ошибка', 'Введите корректный email')
			return
		}
		if (password !== confirmPassword) {
			Alert.alert('Ошибка', 'Пароли не совпадают')
			return
		}

		setLoading(true)
		try {
			const response = await fetch('https://registration-production-3e08.up.railway.app/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			})

			console.log('HTTP статус регистрации:', response.status)

			if (!response.ok) {
				const errorText = await response.text()
				console.error('Ошибка сервера (регистрация):', errorText)
				throw new Error('Ошибка регистрации: ' + errorText)
			}

			const data = await response.json()
			console.log('Ответ сервера (регистрация):', data)

			if (!data.accessToken || !data.refreshToken) {
				throw new Error('Токен не получен')
			}
			const decodedToken = decodeJWT(data.accessToken)
			const userId = decodedToken.userId
			try {
				await AsyncStorage.setItem('authToken', data.accessToken)
				await AsyncStorage.setItem('refreshToken', data.refreshToken)
				await AsyncStorage.setItem('userId', userId)
				console.log('Токены сохранены успешно')
			} catch (error) {
				console.error('Ошибка сохранения токена:', error)
			}

			setAuthenticated(true)
			router.replace('/(app)')

			resetForm()
		} catch (error) {
			console.error('Ошибка запроса (регистрация):', error)
			Alert.alert('Ошибка', 'Произошла ошибка на сервере')
		} finally {
			setLoading(false)
		}
	}

	return (
		<View style={styles.container}>
			<Image source={require('../../assets/logo.png')} style={styles.logo} />
			<Text style={styles.title}>Регистрация</Text>
			<TextInput
				placeholder='Имя'
				placeholderTextColor='#B19CD9'
				value={name}
				onChangeText={setName}
				style={styles.input}
				maxLength={MAX_LENGTH}
			/>
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
			<TextInput
				placeholder='Подтвердите пароль'
				placeholderTextColor='#B19CD9'
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				style={styles.input}
				secureTextEntry
				maxLength={MAX_LENGTH}
			/>
			<Button
				title='Зарегистрироваться'
				onPress={handleRegister}
				disabled={loading}
			/>
			{loading && <ActivityIndicator size='large' color='#B19CD9' />}
			<TouchableOpacity
				onPress={() => router.push('/login')}
				style={styles.linkContainer}
			>
				<Text style={styles.linkText}>Уже есть аккаунт? Войти</Text>
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
