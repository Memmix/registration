import dotenv from 'dotenv'
import jwt, { JwtPayload } from 'jsonwebtoken'
import TokenModel from '../models/token-model'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret'

export default class TokenService {
	static generateTokens(userId: string) {
		const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' })
		const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
			expiresIn: '30d'
		})
		return { accessToken, refreshToken }
	}

	static async saveToken(userId: string, refreshToken: string) {
		await TokenModel.findOneAndUpdate(
			{ userId },
			{ refreshToken },
			{ upsert: true }
		)
	}

	static async verifyAccessToken(token: string): Promise<JwtPayload | null> {
		try {
			const decoded = jwt.verify(token, JWT_SECRET)

			if (typeof decoded === 'string') return null

			return decoded as JwtPayload
		} catch {
			return null
		}
	}

	static async verifyRefreshToken(token: string): Promise<JwtPayload | null> {
		try {
			const decoded = jwt.verify(token, JWT_REFRESH_SECRET)

			if (typeof decoded === 'string') return null

			return decoded as JwtPayload
		} catch {
			return null
		}
	}

	static async removeToken(refreshToken: string) {
		await TokenModel.findOneAndDelete({ refreshToken })
	}
}
