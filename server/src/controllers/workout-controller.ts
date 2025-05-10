import { Request, Response } from 'express'
import { WorkoutService } from './../services/workout-service'

export default class WorkoutController {
	static async getAll(req: Request, res: Response): Promise<Response> {
		try {
			const workouts = await WorkoutService.getAllWorkouts()
			return res.json(workouts)
		} catch (err) {
			return res
				.status(500)
				.json({ message: 'Ошибка при получении тренировок' })
		}
	}

	static async getByUserId(req: Request, res: Response): Promise<Response> {
		try {
			const workout = await WorkoutService.getWorkoutByUserId(req.params.userId)

			if (!workout) {
				return res.status(404).json({ message: 'Тренировка не найдена' })
			}

			return res.json(workout)
		} catch (err) {
			return res
				.status(500)
				.json({ message: 'Ошибка при получении тренировки' })
		}
	}

	static async create(req: Request, res: Response): Promise<Response> {
		try {
			const { userId, exercises } = req.body

			if (!userId || !Array.isArray(exercises)) {
				return res.status(400).json({ message: 'Некорректные данные' })
			}

			const workout = await WorkoutService.createWorkout({ userId, exercises })

			return res.status(201).json(workout)
		} catch (err) {
			return res.status(500).json({ message: 'Ошибка при создании тренировки' })
		}
	}

	static async deleteExerciseByUserId(
		req: Request,
		res: Response
	): Promise<Response> {
		try {
			const { userId, exerciseTitle } = req.params

			if (!userId || !exerciseTitle) {
				return res
					.status(400)
					.json({ message: 'userId и exerciseTitle обязательны' })
			}

			const result = await WorkoutService.deleteExerciseByUserId(
				userId,
				exerciseTitle
			)
			return res.json({ message: 'Упражнение удалено', result })
		} catch (err) {
			console.error('Ошибка удаления упражнения:', err)
			return res.status(500).json({ message: 'Ошибка удаления упражнения' })
		}
	}

	static async markCompleted(req: Request, res: Response): Promise<Response> {
		try {
			const { userId, exerciseTitle, dayIndex } = req.body

			const workout = await WorkoutService.markDayCompleted(
				userId,
				exerciseTitle,
				dayIndex
			)
			return res.json({ message: 'Тренировка завершена', workout })
		} catch (err) {
			return res
				.status(500)
				.json({ message: 'Ошибка при завершении тренировки' })
		}
	}
}
