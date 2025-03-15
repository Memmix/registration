import bcrypt from 'bcrypt'
import rateLimit from 'express-rate-limit'
import User from '../models/user-model'
import TokenService from './token-service'

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: 'Слишком много попыток входа, попробуйте позже'
})

export default class UserService {
	static async register(name: string, email: string, password: string) {
		const existingUser = await User.findOne({ email })
		if (existingUser) throw new Error('Пользователь уже существует')

		const hashedPassword = await bcrypt.hash(password, 10)
		const user = new User({ name, email, password: hashedPassword })
		await user.save()

		const token = TokenService.generateToken(user.id)
		await TokenService.saveToken(user.id, token)

		return { message: 'Регистрация успешна', token, name }
	}

	static async login(email: string, password: string) {
		const user = await User.findOne({ email })
		if (!user) throw new Error('Пользователь не найден')

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) throw new Error('Неверный пароль')

		const token = TokenService.generateToken(user.id)
		await TokenService.saveToken(user.id, token)
	}
}

export { loginLimiter }
