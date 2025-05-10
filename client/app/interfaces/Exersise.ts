export type WorkoutLevel = 'Лёгкий' | 'Средний' | 'Сложный'

export interface Exercise {
	id: string
	name: string
	reps?: number
	sets?: number
	durationSeconds?: number
	image?: string
}

export interface Workout extends Document {
	id: string
	title: string
	duration: string
	level: WorkoutLevel
	description?: string
	image?: string
	exercises?: Exercise[]
}
