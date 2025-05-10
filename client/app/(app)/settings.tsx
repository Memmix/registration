import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from './../(settings)/theme-context'

export default function SettingsScreen() {
	const { theme, toggleTheme } = useTheme()

	const isDark = theme === 'dark'

	const styles = getStyles(isDark)

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Настройки</Text>

			<View style={styles.section}>
				<View style={styles.settingRow}>
					<View style={styles.settingInfo}>
						<Feather name='bell' size={20} color={styles.iconColor.color} />
						<Text style={styles.settingText}>Уведомления</Text>
					</View>
					<Switch
						value={true}
						onValueChange={() => {}}
						trackColor={{ false: '#666', true: '#B19CD9' }}
						thumbColor='#fff'
					/>
				</View>

				<View style={styles.settingRow}>
					<View style={styles.settingInfo}>
						<Feather name='moon' size={20} color={styles.iconColor.color} />
						<Text style={styles.settingText}>
							Тема: {isDark ? 'Тёмная' : 'Светлая'}
						</Text>
					</View>
					<Switch
						value={isDark}
						onValueChange={toggleTheme}
						trackColor={{ false: '#666', true: '#B19CD9' }}
						thumbColor='#fff'
					/>
				</View>

				<TouchableOpacity
					style={styles.settingRow}
					onPress={() => router.push('/(settings)/about')}
				>
					<View style={styles.settingInfo}>
						<Feather name='info' size={20} color={styles.iconColor.color} />
						<Text style={styles.settingText}>О приложении</Text>
					</View>
					<Feather
						name='chevron-right'
						size={20}
						color={isDark ? '#aaa' : '#444'}
					/>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const getStyles = (isDark: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isDark ? '#1E1E2E' : '#F2F2F2',
			paddingTop: 60,
			paddingHorizontal: 20
		},
		title: {
			fontSize: 24,
			fontWeight: 'bold',
			color: isDark ? '#fff' : '#000',
			marginBottom: 30
		},
		section: {
			backgroundColor: isDark ? '#2A2A40' : '#E0E0E0',
			borderRadius: 16,
			paddingVertical: 16,
			paddingHorizontal: 20
		},
		settingRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderBottomColor: isDark ? '#333' : '#ccc'
		},
		settingInfo: {
			flexDirection: 'row',
			alignItems: 'center'
		},
		settingText: {
			color: isDark ? '#fff' : '#000',
			fontSize: 16,
			marginLeft: 12
		},
		iconColor: {
			color: isDark ? '#fff' : '#000'
		}
	})
