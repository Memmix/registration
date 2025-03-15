import mongoose, { Document, Schema } from 'mongoose'

export interface IToken extends Document {
	userId: string
	token: string
}

const TokenSchema = new Schema<IToken>({
	userId: { type: String, required: true },
	token: { type: String, required: true }
})

export default mongoose.model<IToken>('Token', TokenSchema)
