import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
	FlatList,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
	useWindowDimensions
} from 'react-native'
import { io } from 'socket.io-client'
import { useThemedStyles } from './../useThemedStyles'

type WorkoutDay = {
	day: number
	time: number
	calories: number
	date: string // новое поле
}

type Workout = {
	title: string
	days: WorkoutDay[]
}

export default function Home() {
	const [userName, setUserName] = useState<string>('Загрузка...')
	const [workouts, setWorkouts] = useState<Workout[]>([])
	const { styles, colors } = useThemedStyles()
	const { width } = useWindowDimensions()

	useEffect(() => {
		loadUserData()
	}, [])

	const socketRef = useRef<any>(null)

	useEffect(() => {
		const init = async () => {
			const userId = await AsyncStorage.getItem('userId')
			if (!userId) return

			await fetchUserName(userId)

			const socket = io('http://10.0.2.2:5000')
			socketRef.current = socket

			socket.on('connect', () => {
				socket.emit('getStats', userId)
			})
			console.log('Сокет подключён, ID:', socket.id)
			socket.on('statsUpdate', (data: any) => {
				if (Array.isArray(data.exercises)) {
					setWorkouts(prev => [...data.exercises])
				} else {
					setWorkouts([])
				}
			})
		}

		init()

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect()
			}
		}
	}, [])

	const loadUserData = async () => {
		try {
			const userId = await AsyncStorage.getItem('userId')
			if (!userId) return

			await fetchUserName(userId)
			await fetchWorkouts(userId)
		} catch (error) {
			console.log('Ошибка загрузки данных пользователя:', error)
		}
	}

	const fetchUserName = async (userId: string) => {
		try {
			const response = await fetch(
				`http://10.0.2.2:5000/api/currentUser/${userId}`
			)
			if (response.ok) {
				const data = await response.json()
				setUserName(data.name)
			}
		} catch (error) {
			console.log('Ошибка при получении имени пользователя:', error)
		}
	}

	const fetchWorkouts = async (userId: string) => {
		try {
			const response = await fetch(`http://10.0.2.2:5000/api/${userId}`)
			if (response.ok) {
				const data = await response.json()
				if (Array.isArray(data.exercises)) {
					setWorkouts(data.exercises)
				} else {
					setWorkouts([])
				}
			}
		} catch (error) {
			console.log('Ошибка при получении статистики тренировок:', error)
		}
	}

	const calculateTotalStats = () => {
		let totalCalories = 0
		let totalDuration = 0

		if (Array.isArray(workouts)) {
			workouts.forEach(ex => {
				if (Array.isArray(ex.days)) {
					ex.days.forEach(day => {
						totalCalories += day.calories || 0
						totalDuration += day.time || 0
					})
				}
			})
		}

		return { totalCalories, totalDuration }
	}

	const { totalCalories, totalDuration } = calculateTotalStats()

	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: colors.background }}
			contentContainerStyle={{
				flexGrow: 1,
				paddingBottom: 40,
				paddingHorizontal: width * 0.05
			}}
		>
			<View style={{ flex: 1 }}>
				{/* Greeting */}
				<View style={styles.greetingContainer}>
					<Text style={styles.greeting}>Привет, {userName}</Text>
				</View>

				{/* Stats */}
				<View style={styles.statsBox}>
					<Text style={styles.statsTitle}>Общая статистика</Text>
					<Text style={styles.statText}>
						Общее время тренировок: {totalDuration} секунд
					</Text>
					<Text style={styles.statText}>
						Сожжённые калории: {totalCalories} ккал
					</Text>
				</View>

				{/* Workouts List */}
				<View style={styles.tableContainer}>
					<Text style={styles.tableTitle}>Тренировки</Text>
					<FlatList
						data={workouts}
						scrollEnabled={false}
						renderItem={({ item }) => {
							const totalTime =
								item.days?.reduce((sum, d) => sum + d.time, 0) || 0
							const totalCalories =
								item.days?.reduce((sum, d) => sum + d.calories, 0) || 0
							const lastDate = item.days?.[item.days.length - 1]?.date

							return (
								<View style={styles.tableRow}>
									<Text style={styles.tableCell}>{item.title}</Text>
									<Text style={styles.tableCell}>
										дней: {item.days?.length ?? 0}
									</Text>
									<Text style={styles.tableCell}>{totalTime} сек</Text>
									<Text style={styles.tableCell}>{totalCalories} ккал</Text>
									<Text style={styles.tableCell}>
										последняя:{' '}
										{lastDate ? new Date(lastDate).toLocaleDateString() : '—'}
									</Text>
								</View>
							)
						}}
						keyExtractor={item => item.title}
					/>
				</View>

				{/* Start Workout Button */}
				<TouchableOpacity
					onPress={() => router.push('(workout)/train')}
					style={[styles.button, { width: '100%', alignSelf: 'center' }]}
				>
					<Text style={styles.buttonText}>Начать тренировку</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}
