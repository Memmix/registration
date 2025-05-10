import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'

export default function TabLayout() {
	return (
		<Tabs screenOptions={{ tabBarActiveTintColor: '#B19CD9' }}>
			<Tabs.Screen
				name='acc'
				options={{
					headerShown: false,
					title: 'Account',
					tabBarIcon: ({ color }) => (
						<FontAwesome size={28} name='user' color={color} />
					)
				}}
			/>
			<Tabs.Screen
				name='index'
				options={{
					headerShown: false,
					title: 'Home',
					tabBarIcon: ({ color }) => (
						<FontAwesome size={28} name='home' color={color} />
					)
				}}
			/>
			<Tabs.Screen
				name='settings'
				options={{
					headerShown: false,
					title: 'Settings',
					tabBarIcon: ({ color }) => (
						<FontAwesome size={28} name='cog' color={color} />
					)
				}}
			/>
		</Tabs>
	)
}
