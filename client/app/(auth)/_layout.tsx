// app/(auth)/layout.tsx
import { Slot } from 'expo-router'
import { SafeAreaView, StyleSheet, View } from 'react-native'

export default function AuthLayout() {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Slot />
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212' // фон можно настроить
	},
	content: {
		flex: 1,
		padding: 16,
		justifyContent: 'center'
	}
})
