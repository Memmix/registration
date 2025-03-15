import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import TokenModel from '../models/token-model'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export default class TokenService {
	static generateToken(userId: string) {
		return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' })
	}

	static async saveToken(userId: string, token: string) {
		await TokenModel.findOneAndUpdate({ userId }, { token }, { upsert: true })
	}

	static async verifyToken(token: string) {
		try {
			return jwt.verify(token, JWT_SECRET)
		} catch {
			return null
		}
	}
}
