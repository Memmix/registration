// models/workout-model.ts
import mongoose, { Document, Schema } from 'mongoose'

interface ExerciseProgram {
	title: string
	startMaxReps: number
	completedDays: number[]
}

export interface IWorkoutProgram extends Document {
	userId: string
	exercises: ExerciseProgram[]
}

const ExerciseProgramSchema = new Schema<ExerciseProgram>(
	{
		title: { type: String, required: true },
		startMaxReps: { type: Number, required: true },
		completedDays: { type: [Number], default: [] }
	},
	{ _id: false }
)

const WorkoutProgramSchema: Schema = new Schema(
	{
		userId: { type: String, required: true, unique: true },
		exercises: { type: [ExerciseProgramSchema], required: true }
	},
	{ timestamps: true }
)

const Workout = mongoose.model<IWorkoutProgram>(
	'WorkoutProgram',
	WorkoutProgramSchema
)

export default Workout
