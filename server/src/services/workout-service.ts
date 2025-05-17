import Workout from '../models/workout-model'

export class WorkoutService {
	static async getAllWorkouts() {
		try {
			return await Workout.find()
		} catch (err) {
			throw new Error('Ошибка при получении тренировок')
		}
	}

	static async getWorkoutByUserId(userId: string) {
		try {
			const workout = await Workout.findOne({ userId })
			return workout || null
		} catch (err) {
			console.error('Ошибка при поиске по userId:', err)
			throw new Error('Ошибка при получении тренировки')
		}
	}

	static async createWorkout(data: {
		userId: string
		exercises: { title: string; startMaxReps: number; finalGoal?: number }[]
	}) {
		try {
			let workout = await Workout.findOne({ userId: data.userId }) // 🔧 исправлено

			if (!workout) {
				workout = new Workout({
					userId: data.userId,
					exercises: data.exercises.map(ex => ({
						...ex,
						completedDays: [],
						finalGoal: ex.finalGoal ?? 100
					}))
				})
			} else {
				for (const ex of data.exercises) {
					const alreadyExists = workout.exercises.some(
						e => e.title === ex.title
					)
					if (!alreadyExists) {
						workout.exercises.push({
							...ex,
							completedDays: [],
							finalGoal: ex.finalGoal ?? 100
						})
					}
				}
			}

			return await workout.save()
		} catch (err) {
			console.error('Ошибка при добавлении тренировки:', err)
			throw new Error('Ошибка при добавлении тренировки')
		}
	}

	static async deleteExerciseByUserId(userId: string, exerciseTitle: string) {
		try {
			const workout = await Workout.findOne({ userId })
			if (!workout) {
				throw new Error('Программа не найдена для данного пользователя')
			}

			const initialLength = workout.exercises.length

			workout.exercises = workout.exercises.filter(
				ex => ex.title !== exerciseTitle
			)

			if (workout.exercises.length === initialLength) {
				throw new Error('Упражнение с таким названием не найдено')
			}

			await workout.save()
			return workout
		} catch (err) {
			console.error('Ошибка при удалении упражнения:', err)
			throw new Error('Ошибка при удалении упражнения')
		}
	}

	static async markDayCompleted(
		userId: string,
		exerciseTitle: string,
		dayIndex: number
	) {
		try {
			console.log('Получены данные для завершения дня:', {
				userId,
				exerciseTitle,
				dayIndex
			})

			const workout = await Workout.findOne({ userId })
			if (!workout) {
				console.error(`Тренировка не найдена для пользователя: ${userId}`)
				throw new Error('Программа не найдена для данного пользователя')
			}

			const exercise = workout.exercises.find(e => e.title === exerciseTitle)
			if (!exercise) {
				console.error(`Упражнение с названием ${exerciseTitle} не найдено`)
				throw new Error('Упражнение не найдено в тренировке')
			}

			if (!exercise.completedDays.includes(dayIndex)) {
				console.log(
					`Добавляем день ${dayIndex} в завершённые для упражнения: ${exerciseTitle}`
				)
				exercise.completedDays.push(dayIndex)
				await workout.save()
				console.log('День успешно обновлён:', dayIndex)
			} else {
				console.log(
					`День ${dayIndex} уже был завершён для упражнения: ${exerciseTitle}`
				)
			}

			return workout
		} catch (err) {
			console.error('Ошибка при завершении тренировки:', err)
			if (err instanceof Error) {
				console.error('Подробности ошибки:', err.message)
				console.error('Стек ошибки:', err.stack)
			}
			throw new Error('Ошибка при обновлении завершённого дня')
		}
	}
	static async updateFinalGoal(
		userId: string,
		exerciseTitle: string,
		newGoal: number
	) {
		try {
			const workout = await Workout.findOne({ userId })
			if (!workout) throw new Error('Программа не найдена')

			const exercise = workout.exercises.find(e => e.title === exerciseTitle)
			if (!exercise) throw new Error('Упражнение не найдено')

			exercise.finalGoal = newGoal
			await workout.save()
			return workout
		} catch (err) {
			console.error('Ошибка при обновлении цели:', err)
			throw new Error('Ошибка при обновлении цели')
		}
	}
}
