import StatWorkout from '../models/stats-model'
import { io } from './../index'
class StatsService {
	async getStatsByUserId(userId: string) {
		return await StatWorkout.findOne({ userId })
	}

	async updateExerciseDay(
		userId: string,
		exerciseTitle: string,
		day: number,
		time: number,
		calories: number,
		date: Date
	) {
		const workout = await StatWorkout.findOne({ userId })
		if (!workout) return null

		let exercise = workout.exercises.find(ex => ex.title === exerciseTitle)

		if (!exercise) {
			exercise = {
				title: exerciseTitle,
				days: [{ day, time, calories, date }]
			}
			workout.exercises.push(exercise)
		} else {
			const existingDay = exercise.days.find(d => d.day === day)

			if (existingDay) {
				workout.totalTime -= existingDay.time
				workout.totalCalories -= existingDay.calories

				existingDay.time = time
				existingDay.calories = calories
				existingDay.date = date
			} else {
				exercise.days.push({ day, time, calories, date })
			}
		}

		workout.totalTime += time
		workout.totalCalories += calories

		await workout.save()
		console.log(`Отправляю обновления в комнату ${userId}`)
		io.to(userId).emit('statsUpdate', workout)
		return workout
	}

	async createStatsForUser(userId: string) {
		const existing = await StatWorkout.findOne({ userId })
		if (existing) {
			return null
		}

		const newStats = new StatWorkout({
			userId,
			exercises: [],
			totalTime: 0,
			totalCalories: 0
		})
		await newStats.save()
		return newStats
	}
	async deleteExerciseByUserId(userId: string, exerciseTitle: string) {
		const workout = await StatWorkout.findOne({ userId })
		if (!workout) return null

		const exerciseIndex = workout.exercises.findIndex(
			ex => ex.title === exerciseTitle
		)
		if (exerciseIndex === -1) return null

		const exercise = workout.exercises[exerciseIndex]
		const timeToSubtract = exercise.days.reduce((sum, d) => sum + d.time, 0)
		const caloriesToSubtract = exercise.days.reduce(
			(sum, d) => sum + d.calories,
			0
		)

		workout.totalTime -= timeToSubtract
		workout.totalCalories -= caloriesToSubtract

		workout.exercises.splice(exerciseIndex, 1)

		await workout.save()
		return workout
	}
}

export default new StatsService()
