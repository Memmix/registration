import { useAuthStore } from '@/state/auth'
import { Feather } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { useTheme } from '../(settings)/theme-context'

export default function AccountScreen() {
	const { logout } = useAuthStore()
	const [user, setUser] = useState<{
		name: string
		email: string
		profileImage: null | string
	}>({
		name: 'Загрузка...',
		email: 'Загрузка...',
		profileImage: null
	})
	const [isEditing, setIsEditing] = useState(false)
	const [editedName, setEditedName] = useState('')
	const [editedEmail, setEditedEmail] = useState('')
	const [imageUri, setImageUri] = useState<string | null>(null)

	const { theme } = useTheme()
	const isDark = theme === 'dark'
	const styles = getStyles(isDark)
	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (status !== 'granted') {
			alert('Разрешение на доступ к галерее нужно для выбора фото')
			return
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8
		})

		if (!result.canceled && result.assets.length > 0) {
			setImageUri(result.assets[0].uri)
		}
	}
	useEffect(() => {
		const getCurrentUserData = async () => {
			try {
				const userId = await AsyncStorage.getItem('userId')
				if (!userId) return

				const response = await fetch(
					`https://registration-production-3e08.up.railway.app/api/currentUser/${userId}`
				)
				if (!response.ok) return

				const data = await response.json()
				setUser({
					name: data.name || 'Имя не указано',
					email: data.email || 'Email не указан',
					profileImage: data.profileImage || null
				})
			} catch (error) {
				console.log('Fetch error:', error)
			}
		}
		getCurrentUserData()
	}, [])

	const handleLogout = async () => {
		await logout()
		router.replace('/(auth)/login')
	}

	const handleEdit = () => {
		setEditedName(user.name)
		setEditedEmail(user.email)
		setIsEditing(true)
	}
	const handleImageSave = async () => {
		if (!imageUri) return
		const userId = await AsyncStorage.getItem('userId')
		if (!userId) return

		const formData = new FormData()
		formData.append('profileImage', {
			uri: imageUri,
			type: 'image/jpeg',
			name: 'avatar.jpg'
		} as any)

		const uploadResponse = await fetch(
			`https://registration-production-3e08.up.railway.app/api/upload/${userId}`,
			{
				method: 'POST',
				body: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)

		if (uploadResponse.ok) {
			const result = await uploadResponse.json()
			console.log(result.user.profileImage)
			setUser(prev => ({
				...prev,
				profileImage: result.user.profileImage
			}))
			setImageUri(null) // Сбрасываем временный URI
		}
	}

	const handleSave = async () => {
		try {
			const userId = await AsyncStorage.getItem('userId')
			if (!userId) return

			const response = await fetch(
				`https://registration-production-3e08.up.railway.app/api/users/${userId}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						name: editedName,
						email: editedEmail
					})
				}
			)

			if (!response.ok) {
				const errorData = await response.json()
				console.log('Ошибка при обновлении профиля:', errorData.message)
				return
			}

			const updatedUser = await response.json()
			setUser(prev => ({
				name: updatedUser.user.name,
				email: updatedUser.user.email,
				profileImage: prev.profileImage // сохраняем текущее изображение
			}))
			setIsEditing(false)
		} catch (error) {
			console.log('Ошибка при сохранении:', error)
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Image
					key={user.profileImage}
					source={{ uri: imageUri || user.profileImage! }}
					style={{ width: 120, height: 120, borderRadius: 60, padding: 15 }} // здесь было 16
				/>

				<TouchableOpacity
					style={[styles.button, { marginTop: 16 }]}
					onPress={pickImage}
				>
					<Feather name='image' size={20} color={styles.icon.color} />
					<Text style={styles.buttonText}>Выбрать фото</Text>
				</TouchableOpacity>

				{imageUri && (
					<TouchableOpacity style={styles.button} onPress={handleImageSave}>
						<Feather name='upload' size={20} color={styles.icon.color} />
						<Text style={styles.buttonText}>Сохранить фото</Text>
					</TouchableOpacity>
				)}

				<Text style={styles.name}>{user.name}</Text>
				<Text style={styles.email}>{user.email}</Text>
			</View>

			<View style={styles.section}>
				<TouchableOpacity style={styles.button} onPress={handleEdit}>
					<Feather name='edit-2' size={20} color={styles.icon.color} />
					<Text style={styles.buttonText}>Редактировать профиль</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push('(settings)/achivements')}
				>
					<Feather name='award' size={20} color={styles.icon.color} />
					<Text style={styles.buttonText}>Достижения</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<Text style={styles.logoutText}>Выйти</Text>
			</TouchableOpacity>

			{/* Модальное редактирование */}
			{isEditing && (
				<View style={styles.editOverlay}>
					<Text style={styles.editTitle}>Редактировать профиль</Text>
					<TextInput
						style={styles.input}
						value={editedName}
						onChangeText={setEditedName}
						placeholder='Имя'
						placeholderTextColor='#888'
					/>
					<TextInput
						style={styles.input}
						value={editedEmail}
						onChangeText={setEditedEmail}
						placeholder='Email'
						placeholderTextColor='#888'
					/>

					<View style={styles.editButtons}>
						<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
							<Text style={styles.buttonText}>Сохранить</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.saveButton, { backgroundColor: '#ccc' }]}
							onPress={() => setIsEditing(false)}
						>
							<Text style={[styles.buttonText, { color: '#000' }]}>Отмена</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	)
}

const getStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isDark ? '#1E1E2E' : '#F2F2F2',
			alignItems: 'center',
			paddingTop: 60,
			paddingHorizontal: 20
		},
		header: {
			alignItems: 'center',
			marginBottom: 30,
			color: isDark ? '#B19CD9' : '#000'
		},
		editOverlay: {
			position: 'absolute',
			top: 60,
			left: 20,
			right: 20,
			bottom: 60,
			backgroundColor: isDark ? '#2A2A40' : '#fff',
			borderRadius: 20,
			padding: 20,
			elevation: 10,
			shadowColor: '#000',
			shadowOpacity: 0.3,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 5,
			justifyContent: 'center'
		},
		editTitle: {
			fontSize: 20,
			fontWeight: 'bold',
			color: isDark ? '#fff' : '#000',
			marginBottom: 20,
			textAlign: 'center'
		},
		input: {
			borderWidth: 1,
			borderColor: '#ccc',
			borderRadius: 10,
			padding: 12,
			marginBottom: 16,
			color: isDark ? '#fff' : '#000',
			backgroundColor: isDark ? '#3A3A55' : '#F9F9F9'
		},
		editButtons: {
			flexDirection: 'row',
			justifyContent: 'space-around'
		},
		saveButton: {
			backgroundColor: isDark ? '#B19CD9' : '#007AFF',
			paddingVertical: 12,
			paddingHorizontal: 20,
			borderRadius: 20
		},

		name: {
			fontSize: 22,
			fontWeight: 'bold',
			color: isDark ? '#fff' : '#000',
			marginTop: 10
		},
		email: {
			fontSize: 14,
			color: isDark ? '#aaa' : '#555',
			marginTop: 4
		},
		section: {
			width: '100%',
			backgroundColor: isDark ? '#2A2A40' : '#E0E0E0',
			borderRadius: 16,
			paddingVertical: 16,
			paddingHorizontal: 20,
			marginBottom: 30
		},
		// Общий стиль для кнопок
		button: {
			flexDirection: 'row',
			alignItems: 'center',
			marginBottom: 16,
			backgroundColor: isDark ? '#B19CD9' : '#007AFF', // Цвет кнопки, аналогичный кнопке выхода
			paddingVertical: 12,
			paddingHorizontal: 50,
			borderRadius: 30
		},
		buttonText: {
			color: '#fff',
			fontWeight: 'bold',
			fontSize: 16,

			textAlign: 'center'
		},
		icon: {
			color: '#fff'
		},
		accent: {
			color: isDark ? '#fff' : '#000' // Цвет иконки "user"
		},
		// Кнопка выхода
		logoutButton: {
			backgroundColor: isDark ? '#B19CD9' : '#007AFF',
			paddingVertical: 12,
			paddingHorizontal: 50,
			borderRadius: 30
		},
		logoutText: {
			color: '#fff',
			fontWeight: 'bold',
			fontSize: 16
		}
	})
