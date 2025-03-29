import { isAuthenticatedAtom } from '@/state/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Alert, Button, Image, Text, TextInput, View } from 'react-native'

export default function Home() {
	const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom)
	const [image, setImage] = useState<string | null>(null)
	const [title, setTitle] = useState('')
	const [body, setBody] = useState('')
	const [delay, setDelay] = useState('5') // Время в секундах

	useEffect(() => {
		const requestPermissions = async () => {
			const { status: cameraStatus } =
				await ImagePicker.requestCameraPermissionsAsync()
			const { status: mediaStatus } =
				await ImagePicker.requestMediaLibraryPermissionsAsync()
			const { status: locationStatus } =
				await Location.requestForegroundPermissionsAsync()
			const { status: notificationStatus } =
				await Notifications.requestPermissionsAsync()

			if (
				cameraStatus !== 'granted' ||
				mediaStatus !== 'granted' ||
				locationStatus !== 'granted' ||
				notificationStatus !== 'granted'
			) {
				Alert.alert(
					'Ошибка',
					'Некоторые разрешения не были получены. Это может повлиять на работу приложения.'
				)
			}
		}

		requestPermissions()
	}, [])

	const handleLogout = async () => {
		try {
			await AsyncStorage.removeItem('authToken')
			setIsAuthenticated(false)
			router.replace('/(auth)/login')
		} catch (error) {
			console.error('Ошибка при выходе')
		}
	}

	const pickAvatar = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8
		})
		if (!result.canceled) {
			setImage(result.assets[0].uri)
		}
	}

	const scheduleNotification = async () => {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: title || 'Уведомление',
				body: body || 'Это ваше запланированное уведомление!',
				sound: true
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
				seconds: 5,
				repeats: false
			}
		})
		Alert.alert('Готово', 'Уведомление запланировано!')
	}

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ fontSize: 30 }}>Home</Text>
			<Button title='Pick Avatar' onPress={pickAvatar} />
			{image && (
				<Image
					source={{ uri: image }}
					style={{ width: 150, height: 150, borderRadius: 75, marginTop: 20 }}
				/>
			)}
			<TextInput
				placeholder='Заголовок'
				value={title}
				onChangeText={setTitle}
				style={{
					borderBottomWidth: 1,
					width: '80%',
					marginVertical: 10,
					padding: 5
				}}
			/>
			<TextInput
				placeholder='Текст уведомления'
				value={body}
				onChangeText={setBody}
				style={{
					borderBottomWidth: 1,
					width: '80%',
					marginVertical: 10,
					padding: 5
				}}
			/>
			<TextInput
				placeholder='Время в секундах'
				value={delay}
				onChangeText={setDelay}
				keyboardType='numeric'
				style={{
					borderBottomWidth: 1,
					width: '80%',
					marginVertical: 10,
					padding: 5
				}}
			/>
			<Button title='Создать уведомление' onPress={scheduleNotification} />
			<Button title='Logout' onPress={handleLogout} />
		</View>
	)
}
