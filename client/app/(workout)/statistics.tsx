import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { useThemedStyles } from './../useThemedStyles'

const screenWidth = Dimensions.get('window').width * 0.95

const ExerciseStatsScreen = () => {
	const { title } = useLocalSearchParams()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [labels, setLabels] = useState<string[]>([])
	const [caloriesData, setCaloriesData] = useState<number[]>([])
	const { styles, colors } = useThemedStyles()

	const chartConfig = {
		backgroundGradientFrom: colors.background,
		backgroundGradientTo: colors.background,
		color: (opacity = 1) =>
			`${colors.accent}${Math.floor(opacity * 255).toString(16)}`,
		labelColor: (opacity = 1) => colors.text,
		strokeWidth: 2,
		propsForDots: {
			r: '5',
			strokeWidth: '2',
			stroke: colors.accent
		}
	}

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const userId = await AsyncStorage.getItem('userId')
				if (!userId) {
					console.warn('userId не найден в AsyncStorage')
					return
				}

				const res = await axios.get(`http://10.0.2.2:5000/api/${userId}`)
				const stats = res.data

				const exerciseStats = stats.exercises.find(
					(exercise: any) => exercise.title === title
				)

				if (!exerciseStats) {
					console.warn('Упражнение не найдено в данных статистики')
					return
				}

				const dateCaloriesMap: { [key: string]: number } = {}

				exerciseStats.days.forEach((day: any) => {
					const dateISO = new Date(day.date).toISOString().split('T')[0]
					dateCaloriesMap[dateISO] =
						(dateCaloriesMap[dateISO] || 0) + day.calories
				})

				const sortedDates = Object.keys(dateCaloriesMap).sort()

				const labels = sortedDates.map(date =>
					new Date(date).toLocaleDateString('ru-RU', {
						day: '2-digit',
						month: '2-digit'
					})
				)

				const caloriesData = sortedDates.map(date => dateCaloriesMap[date])

				setLabels(labels)
				setCaloriesData(caloriesData)
			} catch (error) {
				console.error('Ошибка при получении статистики:', error)
			} finally {
				setLoading(false)
			}
		}

		if (title) {
			fetchStats()
		}
	}, [title])

	if (loading) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size='large' color={colors.accent} />
			</View>
		)
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Статистика для {title}</Text>

			<LineChart
				data={{ labels, datasets: [{ data: caloriesData }] }}
				width={screenWidth - 32}
				height={280}
				yAxisSuffix=' ккал'
				chartConfig={chartConfig}
				bezier
				style={{ borderRadius: 16 }}
			/>

			<View style={styles.fixedBackButton}>
				<TouchableOpacity
					style={styles.startButton}
					onPress={() => router.back()}
				>
					<Text style={styles.startButtonText}>Назад</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}

export default ExerciseStatsScreen
