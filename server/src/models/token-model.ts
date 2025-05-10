import mongoose, { Document, Schema } from 'mongoose'

export interface IToken extends Document {
	userId: string
	refreshToken: string
}

const TokenSchema = new Schema<IToken>({
	userId: { type: String, required: true },
	refreshToken: { type: String, required: true }
})

export default mongoose.model<IToken>('Token', TokenSchema)
