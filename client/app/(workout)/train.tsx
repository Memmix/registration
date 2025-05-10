import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { useThemedStyles } from '../useThemedStyles'

type ColorKey = 'blue' | 'red' | 'yellow' | 'green'

const workouts: { id: string; title: string; colorKey: ColorKey }[] = [
	{ id: '1', title: 'ОТЖИМАНИЯ', colorKey: 'blue' },
	{ id: '2', title: 'СКРУЧИВАНИЯ', colorKey: 'red' },
	{ id: '3', title: 'ОТЖИМАНИЯ ОТ СКАМЬИ', colorKey: 'yellow' },
	{ id: '4', title: 'ПРИСЕДАНИЯ', colorKey: 'green' }
]

export default function MainTrainingScreen() {
	const router = useRouter()
	const { styles, colors } = useThemedStyles()

	return (
		<View style={styles.container}>
			<Text style={[styles.title, { fontSize: 24, marginBottom: 20 }]}>
				Тренировки
			</Text>

			<FlatList
				data={workouts}
				keyExtractor={w => w.id}
				renderItem={({ item }) => (
					<View
						style={[
							styles.card,
							{
								backgroundColor: colors[item.colorKey],
								marginBottom: 16,
								padding: 16,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								borderRadius: 12
							}
						]}
					>
						<TouchableOpacity
							style={{ flex: 1 }}
							onPress={() =>
								router.push({
									pathname: '/preworksetting',
									params: { title: item.title }
								})
							}
						>
							<Text
								style={[
									styles.text,
									{ fontWeight: 'bold', fontSize: 18, color: '#fff' }
								]}
							>
								{item.title}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() =>
								router.push({
									pathname: '/statistics',
									params: { title: item.title }
								})
							}
							style={{
								marginLeft: 12,
								padding: 8,
								backgroundColor: 'rgba(255,255,255,0.2)',
								borderRadius: 50
							}}
						>
							<Ionicons name='stats-chart' size={24} color='#fff' />
						</TouchableOpacity>
					</View>
				)}
			/>

			<View style={styles.fixedBackButton}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push('/(app)/index')}
				>
					<Text style={styles.buttonText}>Назад</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
