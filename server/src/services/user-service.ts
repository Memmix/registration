import bcrypt from 'bcrypt'
import rateLimit from 'express-rate-limit'
import User from '../models/user-model'
import TokenService from './token-service'

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: 'Слишком много попыток, попробуйте позже'
})

export default class UserService {
	static async register(name: string, email: string, password: string) {
		const existingUser = await User.findOne({ email })
		if (existingUser) throw new Error('Пользователь уже существует')

		const hashedPassword = await bcrypt.hash(password, 10)
		const user = new User({ name, email, password: hashedPassword })
		await user.save()

		const { accessToken, refreshToken } = TokenService.generateTokens(user.id)
		await TokenService.saveToken(user.id, refreshToken)

		return { message: 'Регистрация успешна', accessToken, refreshToken, name }
	}

	static async login(email: string, password: string) {
		const user = await User.findOne({ email })
		if (!user) throw new Error('Пользователь не найден')

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) throw new Error('Неверный пароль')

		const { accessToken, refreshToken } = TokenService.generateTokens(user.id)
		await TokenService.saveToken(user.id, refreshToken)

		return { accessToken, refreshToken }
	}

	static async logout(refreshToken: string) {
		await TokenService.removeToken(refreshToken)
	}
	static async getCurrentUser(userId: string) {
		const user = await User.findById(userId)
		return user
	}
	static async updateProfile(
		userId: string,
		updates: { name?: string; email?: string }
	) {
		const user = await User.findById(userId)
		if (!user) throw new Error('Пользователь не найден')

		if (updates.email && updates.email !== user.email) {
			const existingEmailUser = await User.findOne({ email: updates.email })
			if (existingEmailUser) throw new Error('Email уже используется')
		}

		if (updates.name) user.name = updates.name
		if (updates.email) user.email = updates.email

		await user.save()
		return user
	}
	static async saveProfileImage(userId: string, imagePath: string) {
		const user = await User.findById(userId)
		if (!user) throw new Error('Пользователь не найден')

		user.profileImage = imagePath
		await user.save()

		return user
	}
}
