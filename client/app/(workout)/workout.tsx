import AsyncStorage from '@react-native-async-storage/async-storage'

import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { io } from 'socket.io-client'
import { useThemedStyles } from './../useThemedStyles'
export default function TrainingScreen() {
	const { week, day, sets, title } = useLocalSearchParams<{
		week: string
		day: string
		sets: string
		title: string
	}>()

	const { styles, colors } = useThemedStyles()
	const router = useRouter()
	const socket = useRef(io('http://10.0.2.2:5000')).current
	const parsedSets = sets ? sets.split(',').map(Number) : []
	const [currentSetIndex, setCurrentSetIndex] = useState(0)
	const [isFinished, setIsFinished] = useState(false)
	const [resting, setResting] = useState(false)
	const [restTime, setRestTime] = useState(30)
	const [startTime, setStartTime] = useState<number | null>(null)

	useEffect(() => {
		if (!startTime) {
			setStartTime(Date.now())
		}
	}, [])

	useEffect(() => {
		let timer: NodeJS.Timeout
		if (resting && restTime > 0) {
			timer = setTimeout(() => setRestTime(prev => prev - 1), 1000)
		} else if (resting && restTime === 0) {
			setResting(false)
			setRestTime(30)
		}
		return () => clearTimeout(timer)
	}, [resting, restTime])

	const handleNextSet = () => {
		if (currentSetIndex < parsedSets.length - 1) {
			setResting(true)
			setCurrentSetIndex(prev => prev + 1)
		} else {
			setIsFinished(true)
		}
	}

	const handleSkipRest = () => {
		setResting(false)
		setRestTime(30)
	}

	const handleFinish = async () => {
		const userId = await AsyncStorage.getItem('userId')
		if (!userId || !title || !startTime) {
			console.warn('Не хватает данных для завершения тренировки')
			return
		}

		const dayIndex = (Number(week) - 1) * 3 + (Number(day) - 1)
		const durationInSeconds = Math.round((Date.now() - startTime) / 1000)
		const durationInMinutes = Math.max(1, Math.round(durationInSeconds))
		const totalReps = parsedSets.reduce((acc, val) => acc + val, 0)
		const caloriesBurned = Math.round(totalReps * 0.3)

		try {
			await fetch('http://10.0.2.2:5000/api/workouts/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, exerciseTitle: title, dayIndex })
			})
			socket.emit('workoutCompleted', { userId, title, dayIndex })

			const res = await fetch(`http://10.0.2.2:5000/api/${userId}/update`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					exerciseTitle: title,
					day: dayIndex,
					time: durationInMinutes,
					calories: caloriesBurned,
					date: new Date().toISOString()
				})
			})
			if (!res.ok) {
				const errorText = await res.text()
				console.error('Ошибка от сервера:', errorText)
				return
			}
		} catch (err) {
			console.error('Ошибка при запросе:', err)
		}

		router.back()
	}

	return (
		<View style={[styles.container, { paddingHorizontal: 20, paddingTop: 40 }]}>
			<Text style={[styles.greeting, { color: colors.subtext }]}>
				Неделя {week} День {day}
			</Text>

			{!isFinished ? (
				<>
					{resting ? (
						<View style={styles.card}>
							<Text style={[styles.greeting, { marginBottom: 10 }]}>Отдых</Text>
							<Text style={[styles.buttonText, { fontSize: 40 }]}>
								{restTime} сек
							</Text>
							<TouchableOpacity
								style={[
									styles.button,
									{
										backgroundColor: 'transparent',
										borderWidth: 1,
										borderColor: colors.accent
									}
								]}
								onPress={handleSkipRest}
							>
								<Text style={[styles.buttonText, { color: colors.accent }]}>
									Пропустить отдых
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View style={styles.card}>
							<Text style={styles.subtext}>
								Подход {currentSetIndex + 1} из {parsedSets.length}
							</Text>
							<Text
								style={[styles.greeting, { fontSize: 48, color: colors.text }]}
							>
								{parsedSets[currentSetIndex]} повторений
							</Text>
							<TouchableOpacity style={styles.button} onPress={handleNextSet}>
								<Text style={styles.buttonText}>
									{currentSetIndex === parsedSets.length - 1
										? 'Завершить тренировку'
										: 'Закончить подход'}
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</>
			) : (
				<View style={styles.card}>
					<Text style={[styles.greeting, { color: colors.subtext }]}>
						Тренировка завершена!
					</Text>
					<TouchableOpacity style={styles.button} onPress={handleFinish}>
						<Text style={styles.buttonText}>На главную</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	)
}
