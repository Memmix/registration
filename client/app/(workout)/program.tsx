import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
	Dimensions,
	FlatList,
	Modal,
	Text,
	TextInput,
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
	const [goalValue, setGoalValue] = useState('125')
	const [isModalVisible, setModalVisible] = useState(false)

	const hasSentProgram = useRef(false)
	const router = useRouter()
	const { styles } = useThemedStyles()
	const socket = useRef(
		io('https://registration-production-3e08.up.railway.app')
	).current

	const fetchCompletedDays = async () => {
		const userId = await AsyncStorage.getItem('userId')
		if (!userId || !title) return

		try {
			const res = await fetch(
				`https://registration-production-3e08.up.railway.app/api/${userId}`
			)
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

	const fetchFinalGoal = async () => {
		const userId = await AsyncStorage.getItem('userId')
		if (!userId || !title) return

		try {
			const res = await fetch(
				`https://registration-production-3e08.up.railway.app/api/workouts/user/${userId}`
			)
			if (res.ok) {
				const data = await res.json()
				const found = data.exercises.find((e: any) => e.title === title)
				if (found?.finalGoal) {
					setGoalValue(found.finalGoal.toString())
				}
			}
		} catch (err) {
			console.error('Ошибка при загрузке цели:', err)
		}
	}

	useEffect(() => {
		const handleUpdateWorkout = (data: any) => {
			if (data && data.title === title) {
				fetchCompletedDays()
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
		fetchCompletedDays()
		fetchFinalGoal()
	}, [title])

	const days = useMemo(() => {
		if (!maxReps) return []

		const daysArray = []
		const startReps = Number(maxReps)
		const totalTrainings = 6 * 3
		const finalGoal = Number(goalValue)
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
	}, [maxReps, goalValue])

	useEffect(() => {
		const createWorkoutProgram = async () => {
			const userId = await AsyncStorage.getItem('userId')
			if (!userId || !title) return

			try {
				const checkResponse = await fetch(
					`https://registration-production-3e08.up.railway.app/api/workouts/user/${userId}`
				)
				if (checkResponse.ok) {
					const data = await checkResponse.json()
					const exists = data.exercises.some((e: any) => e.title === title)
					if (exists) return
				}

				await fetch(
					'https://registration-production-3e08.up.railway.app/api/workouts',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							userId,
							exercises: [
								{
									title,
									startMaxReps: Number(maxReps),
									finalGoal: Number(goalValue),
									completedDays: []
								}
							]
						})
					}
				)

				await fetch(
					'https://registration-production-3e08.up.railway.app/api/stats',
					{
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
					}
				)
			} catch (err) {
				console.error('Ошибка при создании программы или статистики:', err)
			}
		}

		if (maxReps && !hasSentProgram.current) {
			hasSentProgram.current = true
			createWorkoutProgram()
		}
	}, [maxReps, title, goalValue])

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
			await fetch(
				`https://registration-production-3e08.up.railway.app/api/workouts/${userId}/${title}`,
				{
					method: 'DELETE'
				}
			)

			await fetch(
				`https://registration-production-3e08.up.railway.app/api/${userId}/delete/${title}`,
				{
					method: 'DELETE'
				}
			)
		}
		await AsyncStorage.removeItem(`maxReps_${title}`)
		router.replace({ pathname: '/(workout)/preworksetting', params: { title } })
	}

	const handleSaveGoal = async () => {
		const userId = await AsyncStorage.getItem('userId')
		if (!userId || !title) return

		try {
			await fetch(
				'https://registration-production-3e08.up.railway.app/api/updateGoal',
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId,
						exerciseTitle: title,
						finalGoal: Number(goalValue)
					})
				}
			)

			console.log('Сохраняем цель:', goalValue)
			setModalVisible(false)

			// Подгрузи новую цель снова с сервера (на всякий случай)
			const res = await fetch(
				`https://registration-production-3e08.up.railway.app/api/workouts/user/${userId}`
			)
			if (res.ok) {
				const data = await res.json()
				const program = data.exercises.find((e: any) => e.title === title)
				if (program && program.finalGoal) {
					setGoalValue(program.finalGoal.toString())
				}
			}
		} catch (err) {
			console.error('Ошибка при обновлении цели:', err)
		}
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={days}
				keyExtractor={item => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.flatListContent, { paddingBottom: 100 }]} // место для кнопки
				ListHeaderComponent={
					<View style={[styles.headerRow, { flexWrap: 'wrap', gap: 10 }]}>
						<Text style={[styles.title, { fontSize: 22, flexShrink: 1 }]}>
							Программа: {title}
						</Text>
						<View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
							<TouchableOpacity
								onPress={handleReset}
								style={styles.resetButton}
							>
								<Text style={styles.resetButtonText}>Сбросить</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => setModalVisible(true)}
								style={styles.resetButton}
							>
								<Text style={styles.resetButtonText}>Изменить цель</Text>
							</TouchableOpacity>
						</View>
					</View>
				}
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

			{/* Кнопка "Назад" закреплённая снизу и меньше */}
			<View
				style={{
					position: 'absolute',
					bottom: 20,
					left: 20,
					right: 20,
					alignItems: 'center'
				}}
			>
				<TouchableOpacity
					style={[
						styles.startButton,
						{
							width: '50%', // Сделаем её меньше
							borderRadius: 12,
							paddingVertical: 10
						}
					]}
					onPress={() => router.back()}
				>
					<Text style={styles.startButtonText}>Назад</Text>
				</TouchableOpacity>
			</View>

			{/* Модалка изменения цели */}
			<Modal visible={isModalVisible} animationType='slide' transparent>
				<View
					style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.6)',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<View
						style={{
							backgroundColor: 'white',
							padding: 20,
							borderRadius: 16,
							width: '80%'
						}}
					>
						<Text
							style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}
						>
							Выберите или введите цель (повт.)
						</Text>

						{/* Ввод кастомного значения */}
						<TextInput
							value={goalValue}
							onChangeText={setGoalValue}
							keyboardType='numeric'
							placeholder='Введите свою цель'
							style={{
								borderWidth: 1,
								borderColor: '#ccc',
								borderRadius: 8,
								padding: 10,
								marginBottom: 15,
								textAlign: 'center',
								fontSize: 18
							}}
						/>

						<FlatList
							data={Array.from({ length: 101 }, (_, i) => (i + 50).toString())}
							keyExtractor={item => item}
							style={{ maxHeight: 200 }}
							contentContainerStyle={{ alignItems: 'center' }}
							renderItem={({ item }) => (
								<TouchableOpacity
									onPress={() => setGoalValue(item)}
									style={{
										paddingVertical: 8,
										backgroundColor:
											goalValue === item ? '#ddd' : 'transparent',
										width: '100%',
										alignItems: 'center'
									}}
								>
									<Text style={{ fontSize: 20 }}>{item}</Text>
								</TouchableOpacity>
							)}
						/>

						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-around',
								marginTop: 15
							}}
						>
							<TouchableOpacity onPress={() => setModalVisible(false)}>
								<Text style={{ color: 'red' }}>Отмена</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={handleSaveGoal}>
								<Text style={{ color: 'green' }}>Сохранить</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	)
}
