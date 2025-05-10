import { Request, Response } from 'express'
import TokenService from '../services/token-service'
import UserService from '../services/user-service'
class UserController {
	static async register(req: Request, res: Response): Promise<void> {
		try {
			const { name, email, password } = req.body
			if (!name || !email || !password) {
				res.status(400).json({ message: 'Все поля обязательны' })
				return
			}

			const { message, accessToken, refreshToken } = await UserService.register(
				name,
				email,
				password
			)

			res.status(201).json({ message, accessToken, refreshToken })
		} catch (error) {
			res.status(400).json({ message: (error as Error).message })
		}
	}

	static async login(req: Request, res: Response): Promise<void> {
		try {
			const { email, password } = req.body
			if (!email || !password) {
				res.status(400).json({ message: 'Email и пароль обязательны' })
				return
			}

			const { accessToken, refreshToken } = await UserService.login(
				email,
				password
			)
			res
				.status(200)
				.json({ message: 'Вход выполнен', accessToken, refreshToken })
		} catch (error) {
			res.status(401).json({ message: (error as Error).message })
		}
	}

	static async refreshToken(req: Request, res: Response): Promise<void> {
		try {
			const { refreshToken } = req.body
			if (!refreshToken) {
				res.status(401).json({ message: 'Токен обязателен' })
				return
			}

			const tokenData = await TokenService.verifyRefreshToken(refreshToken)
			if (!tokenData) {
				res.status(403).json({ message: 'Недействительный токен ' })
				return
			}

			const { accessToken, refreshToken: newRefreshToken } =
				TokenService.generateTokens(tokenData.userId)
			await TokenService.saveToken(tokenData.userId, newRefreshToken)

			res.status(200).json({ accessToken, refreshToken: newRefreshToken })
		} catch (error) {
			res.status(500).json({ message: 'Ошибка сервера' })
		}
	}

	static async logout(req: Request, res: Response): Promise<void> {
		try {
			const { refreshToken } = req.body
			if (!refreshToken) {
				res.status(400).json({ message: 'Токен обязателен' })
				return
			}

			await UserService.logout(refreshToken)
			res.status(200).json({ message: 'Выход выполнен' })
		} catch (error) {
			res.status(500).json({ message: 'Ошибка сервера' })
		}
	}
	static async getCurrentUser(req: Request, res: Response): Promise<void> {
		try {
			const user = await UserService.getCurrentUser(req.params.userId)

			res.status(200).json(user)
		} catch (error) {
			res.status(500).json({ message: 'Ошибка сервера' })
		}
	}
	static async updateProfile(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.params.userId
			const { name, email } = req.body

			if (!name && !email) {
				res
					.status(400)
					.json({ message: 'Нужно указать имя или email для обновления' })
				return
			}

			const updatedUser = await UserService.updateProfile(userId, {
				name,
				email
			})

			res.status(200).json({ message: 'Профиль обновлён', user: updatedUser })
		} catch (error) {
			res.status(400).json({ message: (error as Error).message })
		}
	}
	static async uploadProfileImage(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.params.userId
			if (!req.file) {
				res.status(400).json({ message: 'Файл не загружен' })
				return
			}

			const filePath = `/uploads/${req.file.filename}`

			const fullImageUrl = `http://10.0.2.2:5000${filePath}`

			const user = await UserService.saveProfileImage(userId, fullImageUrl)

			res.status(200).json({ message: 'Фото обновлено', user })
		} catch (error) {
			res.status(500).json({ message: 'Ошибка при загрузке фото' })
		}
	}
}
export default UserController
