import { isAuthenticatedAtom } from '@/state/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
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
	const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom)

	useEffect(() => {
		if (isAuthenticated) {
			router.replace('/(app)')
		}
	}, [isAuthenticated])

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('Ошибка', 'Все поля должны быть заполнены')
			return
		}

		setLoading(true)
		try {
			const response = await fetch('http://10.0.2.2:5000/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			})

			console.log('HTTP статус входа:', response.status)

			const textResponse = await response.text() // Читаем ответ как текст
			console.log('Ответ сервера (сырой):', textResponse)

			let data
			try {
				data = JSON.parse(textResponse) // Парсим JSON
			} catch (jsonError) {
				throw new Error('Ошибка парсинга JSON: ' + jsonError)
			}

			console.log('Ответ сервера (разобранный JSON):', data)

			if (!data.token) {
				throw new Error('Токен не получен')
			}

			await AsyncStorage.setItem('authToken', data.token)
			setIsAuthenticated(true)
			router.replace('/(app)')

			Alert.alert('Добро пожаловать!')
			resetForm()
		} catch (error) {
			console.error('Ошибка запроса (вход):', error)
			Alert.alert('Ошибка', 'Произошла ошибка на сервере')
		} finally {
			setLoading(false)
		}
	}

	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				padding: 16
			}}
		>
			<TextInput
				placeholder='Email'
				value={email}
				onChangeText={setEmail}
				keyboardType='email-address'
				style={{ borderBottomWidth: 1, width: '80%', marginBottom: 16 }}
				maxLength={MAX_LENGTH}
			/>
			<TextInput
				placeholder='Пароль'
				value={password}
				onChangeText={setPassword}
				style={{ borderBottomWidth: 1, width: '80%', marginBottom: 16 }}
				secureTextEntry
				maxLength={MAX_LENGTH}
			/>
			<Button title='Войти' onPress={handleLogin} disabled={loading} />
			{loading && <ActivityIndicator size='large' color='#0000ff' />}

			<TouchableOpacity
				onPress={() => router.push('/register')}
				style={{ marginTop: 16 }}
			>
				<Text style={{ color: 'blue' }}>Нет аккаунта? Зарегистрируйтесь</Text>
			</TouchableOpacity>
		</View>
	)
}
