import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
	Dimensions,
	FlatList,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { io } from 'socket.io-client'
import { useThemedStyles } from './../useThemedStyles'
const { width } = Dimensions.get('window')

export default function ProgramScreen() {
	const { title } = useLocalSearchParams<{ title: string }>()
	const [maxReps, setMaxReps] = useState<string | null>(null)
	const [completedDays, setCompletedDays] = useState<number[]>([])
	const hasSentProgram = useRef(false)
	const router = useRouter()
	const { styles } = useThemedStyles()
	const socket = useRef(io('http://10.0.2.2:5000')).current
	const fetchCompletedDays = async () => {
		const userId = await AsyncStorage.getItem('userId')
		if (!userId || !title) return

		try {
			const res = await fetch(`http://10.0.2.2:5000/api/${userId}`)
			if (res.ok) {
				const data = await res.json()
				const program = data.exercises.find((e: any) => e.title === title)
				const completed = program?.days.map((d: any) => d.day) || []
				setCompletedDays(completed)
			}
		} catch (err) {
			console.error('Ошибка при загрузке статистики:', err)
		}
	}

	useEffect(() => {
		const handleUpdateWorkout = (data: any) => {
			if (data && data.title === title) {
				fetchCompletedDays() // обновляем список завершённых дней
			}
		}

		socket.on('updateWorkout', handleUpdateWorkout)

		return () => {
			socket.off('updateWorkout', handleUpdateWorkout)
		}
	}, [title])
	useEffect(() => {
		const fetchMaxReps = async () => {
			if (!title) return
			const reps = await AsyncStorage.getItem(`maxReps_${title}`)
			if (!reps) {
				router.replace({
					pathname: '/(workout)/preworksetting',
					params: { title }
				})
			} else {
				setMaxReps(reps)
			}
		}
		fetchMaxReps()
		fetchCompletedDays() // запускаем один раз при старте
	}, [title])

	const days = useMemo(() => {
		if (!maxReps) return []

		const daysArray = []
		const startReps = Number(maxReps)

		const totalTrainings = 6 * 3
		const finalGoal = 125
		let currentTotal = startReps * 1.5
		const growthFactor = Math.pow(
			finalGoal / currentTotal,
			1 / (totalTrainings - 1)
		)

		for (let training = 0; training < totalTrainings; training++) {
			const baseTotal = Math.round(currentTotal)

			const set1 = Math.max(5, Math.round(baseTotal * 0.28))
			const set2 = Math.max(5, Math.round(baseTotal * 0.2))
			const set3 = Math.max(5, Math.round(baseTotal * 0.23))
			const set4 = Math.max(5, Math.round(baseTotal * 0.26))
			const set5 = Math.max(5, baseTotal - (set1 + set2 + set3))

			daysArray.push({
				id: training.toString(),
				week: Math.floor(training / 3) + 1,
				day: (training % 3) + 1,
				sets: [set1, set2, set3, set4, set5]
			})

			currentTotal *= growthFactor
		}

		return daysArray
	}, [maxReps])

	useEffect(() => {
		const createWorkoutProgram = async () => {
			const userId = await AsyncStorage.getItem('userId')
			if (!userId || !title) return

			try {
				const checkResponse = await fetch(
					`http://10.0.2.2:5000/api/workouts/user/${userId}`
				)
				if (checkResponse.ok) {
					const data = await checkResponse.json()
					const exists = data.exercises.some((e: any) => e.title === title)
					if (exists) return
				}

				await fetch('http://10.0.2.2:5000/api/workouts', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId,
						exercises: [
							{
								title,
								startMaxReps: Number(maxReps),
								completedDays: []
							}
						]
					})
				})

				await fetch('http://10.0.2.2:5000/api/stats', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId,
						exercises: [
							{
								title,
								days: []
							}
						]
					})
				})
			} catch (err) {
				console.error('Ошибка при создании программы или статистики:', err)
			}
		}

		if (maxReps && !hasSentProgram.current) {
			hasSentProgram.current = true
			createWorkoutProgram()
		}
	}, [maxReps, title])

	const isDayCompleted = (week: number, day: number) => {
		const index = (week - 1) * 3 + (day - 1)
		return completedDays.includes(index)
	}

	const handleStartDay = (day: {
		week: number
		day: number
		sets: number[]
	}) => {
		router.push({
			pathname: '/(workout)/workout',
			params: {
				title,
				week: day.week.toString(),
				day: day.day.toString(),
				sets: day.sets.join(',')
			}
		})
	}

	const handleReset = async () => {
		const userId = await AsyncStorage.getItem('userId')
		if (userId && title) {
			await fetch(`http://10.0.2.2:5000/api/workouts/${userId}/${title}`, {
				method: 'DELETE'
			})

			await fetch(`http://10.0.2.2:5000/api/${userId}/delete/${title}`, {
				method: 'DELETE'
			})
		}

		await AsyncStorage.removeItem(`maxReps_${title}`)
		router.replace({ pathname: '/(workout)/preworksetting', params: { title } })
	}

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={[styles.title, { fontSize: 22 }]}>Программа: {title}</Text>
				<TouchableOpacity onPress={handleReset} style={styles.resetButton}>
					<Text style={styles.resetButtonText}>Сбросить</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={days}
				keyExtractor={item => item.id}
				showsVerticalScrollIndicator={false}
				snapToAlignment='start'
				decelerationRate='fast'
				contentContainerStyle={styles.flatListContent}
				renderItem={({ item }) => {
					const completed = isDayCompleted(item.week, item.day)

					return (
						<View style={[styles.dayCard, { width: width * 0.9 }]}>
							<Text style={styles.dayLabel}>
								Неделя {item.week} День {item.day}
							</Text>

							<View style={styles.setsRow}>
								{item.sets.map((set, idx) => (
									<Text key={idx} style={styles.setText}>
										{set}
									</Text>
								))}
							</View>

							<TouchableOpacity
								style={[
									styles.startButton,
									completed && { backgroundColor: '#444' }
								]}
								onPress={() => !completed && handleStartDay(item)}
								disabled={completed}
							>
								<Text
									style={[
										styles.startButtonText,
										completed && { color: '#999' }
									]}
								>
									{completed ? 'Пройдено' : 'Старт'}
								</Text>
							</TouchableOpacity>
						</View>
					)
				}}
			/>
		</View>
	)
}
