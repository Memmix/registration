import { isAuthenticatedAtom } from '@/state/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { Button, Image, Text, View } from 'react-native'

export default function Home() {
	const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom)
	const [image, setImage] = useState<string | null>(null)

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
			setImage(result.assets[0].uri) // Set the selected image URI
		}
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
			<Button title='Logout' onPress={handleLogout} />
		</View>
	)
}
