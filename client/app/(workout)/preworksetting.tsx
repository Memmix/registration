import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useThemedStyles } from './../useThemedStyles' // Путь к хуку useThemedStyles

export default function PreWorkSettingScreen() {
	const [maxReps, setMaxReps] = useState('')
	const router = useRouter()
	const { title } = useLocalSearchParams()

	const key = `maxReps_${title}`

	const { styles } = useThemedStyles()

	useEffect(() => {
		const checkMaxReps = async () => {
			const storedMaxReps = await AsyncStorage.getItem(key)
			if (storedMaxReps) {
				router.replace({
					pathname: '/(workout)/program',
					params: { title }
				})
			}
		}

		if (title) {
			checkMaxReps()
		}
	}, [title])

	const handleStart = async () => {
		if (!maxReps || !title) return
		await AsyncStorage.setItem(key, maxReps)
		router.replace({
			pathname: '/(workout)/program',
			params: { title }
		})
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				Введите сколько повторений вы можете совершить за один подход. Это
				поможет составить индивидуальную систему тренировок.
			</Text>

			<TextInput
				style={styles.input}
				keyboardType='numeric'
				value={maxReps}
				onChangeText={setMaxReps}
				placeholder='Введите количество'
				placeholderTextColor={styles.subtext.color}
			/>
			<TouchableOpacity style={styles.button} onPress={handleStart}>
				<Text style={styles.buttonText}>Начать</Text>
			</TouchableOpacity>
			<View style={styles.fixedBackButton}>
				<TouchableOpacity style={styles.button} onPress={router.back}>
					<Text style={styles.buttonText}>Назад</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
