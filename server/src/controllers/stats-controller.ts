import { Request, Response } from 'express'

import StatsService from './../services/stats-service'
class StatsController {
	async getStats(req: Request, res: Response) {
		try {
			const userId = req.params.userId
			console.time('fetchStats')
			const stats = await StatsService.getStatsByUserId(userId)
			console.timeEnd('fetchStats')
			if (!stats) {
				return res.status(404).json({ message: 'Данные не найдены' })
			}
			res.json(stats)
		} catch (error) {
			console.error('Ошибка при получении статистики:', error)
			res.status(500).json({ message: 'Внутренняя ошибка сервера' })
		}
	}

	async updateExerciseDay(req: Request, res: Response) {
		try {
			const { userId } = req.params
			const { exerciseTitle, day, time, calories, date } = req.body

			const updatedStats = await StatsService.updateExerciseDay(
				userId,
				exerciseTitle,
				day,
				time,
				calories,
				new Date(date)
			)

			if (!updatedStats) {
				return res.status(404).json({ message: 'Пользователь не найден' })
			}

			res.json(updatedStats)
		} catch (error) {
			console.error('Ошибка при обновлении дня:', error)
			res.status(500).json({ message: 'Внутренняя ошибка сервера' })
		}
	}
	async createStats(req: Request, res: Response) {
		try {
			const { userId } = req.body

			const createdStats = await StatsService.createStatsForUser(userId)

			if (!createdStats) {
				return res.status(400).json({ message: 'Статистика уже существует' })
			}

			res.status(201).json(createdStats)
		} catch (error) {
			console.error('Ошибка при создании статистики:', error)
			res.status(500).json({ message: 'Внутренняя ошибка сервера' })
		}
	}
	async deleteExerciseByUserId(req: Request, res: Response): Promise<Response> {
		try {
			const { userId, exerciseTitle } = req.params

			if (!userId || !exerciseTitle) {
				return res.status(400).json({
					message: 'userId и exerciseTitle обязательны'
				})
			}

			const result = await StatsService.deleteExerciseByUserId(
				userId,
				exerciseTitle
			)

			if (!result) {
				return res.status(404).json({ message: 'Упражнение не найдено' })
			}

			return res.json({ message: 'Упражнение успешно удалено', result })
		} catch (err) {
			console.error('Ошибка при удалении упражнения из статистики:', err)
			return res.status(500).json({ message: 'Внутренняя ошибка сервера' })
		}
	}
}

export default new StatsController()
