import { Request, Response } from 'express'
import UserService from '../services/user-service'

class UserController {
	static async register(req: Request, res: Response): Promise<void> {
		try {
			const { name, email, password } = req.body
			if (!name || !email || !password) {
				res.status(400).json({ message: 'Все поля обязательны' })
				return
			}

			// Получаем `token` из `UserService.register`
			const { message, token } = await UserService.register(
				name,
				email,
				password
			)

			// Возвращаем `token` клиенту
			res.status(201).json({ message, token })
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

			// Деструктурируем token из результата
			const { token } = await UserService.login(email, password)
			res.status(200).json({ message: 'Вход выполнен', token }) // Теперь клиент получит токен
		} catch (error) {
			res.status(401).json({ message: (error as Error).message })
		}
	}
}

export default UserController
