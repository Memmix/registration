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

	const [loading, setLoading] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom)

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
			const response = await fetch('http://10.0.2.2:5000/api/register', {
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

			if (!data.token) {
				throw new Error('Токен не получен')
			}

			await AsyncStorage.setItem('authToken', data.token)
			setIsAuthenticated(true)
			router.replace('/(app)')

			Alert.alert('Успех', `${data.message}`)
			resetForm()
		} catch (error) {
			console.error('Ошибка запроса (регистрация):', error)
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
				placeholder='Имя'
				value={name}
				onChangeText={setName}
				style={{ borderBottomWidth: 1, width: '80%', marginBottom: 16 }}
				maxLength={MAX_LENGTH}
			/>
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
			<TextInput
				placeholder='Подтвердите пароль'
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				style={{ borderBottomWidth: 1, width: '80%', marginBottom: 16 }}
				secureTextEntry
				maxLength={MAX_LENGTH}
			/>
			<Button
				title='Зарегистрироваться'
				onPress={handleRegister}
				disabled={loading}
			/>
			{loading && <ActivityIndicator size='large' color='#0000ff' />}

			<TouchableOpacity
				onPress={() => router.push('/login')}
				style={{ marginTop: 16 }}
			>
				<Text style={{ color: 'blue' }}>Уже есть аккаунт? Войти</Text>
			</TouchableOpacity>
		</View>
	)
}
