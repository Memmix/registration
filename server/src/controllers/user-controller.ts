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

			const user = await UserService.register(name, email, password)
			res.status(201).json({ message: 'Пользователь зарегистрирован', user })
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

			const token = await UserService.login(email, password)
			res.status(200).json({ message: 'Вход выполнен', token })
		} catch (error) {
			res.status(401).json({ message: (error as Error).message })
		}
	}
}

export default UserController
