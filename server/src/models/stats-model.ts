import mongoose, { Document, Schema } from 'mongoose'

// Описание одного дня упражнения
interface ExerciseDay {
	day: number
	time: number
	calories: number
	date: Date
}

interface Exercise {
	title: string
	days: ExerciseDay[]
}

export interface IWorkoutData extends Document {
	userId: string
	totalCalories: number
	totalTime: number
	exercises: Exercise[]
}

const ExerciseDaySchema = new Schema<ExerciseDay>(
	{
		day: { type: Number, required: true },
		time: { type: Number, required: true },
		calories: { type: Number, required: true },
		date: { type: Date, required: true }
	},
	{ _id: false }
)

const ExerciseSchema = new Schema<Exercise>(
	{
		title: { type: String, required: true },
		days: { type: [ExerciseDaySchema], required: true }
	},
	{ _id: false }
)

const WorkoutDataSchema = new Schema<IWorkoutData>(
	{
		userId: { type: String, required: true, unique: true },
		totalCalories: { type: Number, default: 0 },
		totalTime: { type: Number, default: 0 },
		exercises: { type: [ExerciseSchema], required: true }
	},
	{ timestamps: true }
)

const StatWorkout = mongoose.model<IWorkoutData>(
	'Statistics',
	WorkoutDataSchema
)
export default StatWorkout
