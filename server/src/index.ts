import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import path from 'path'
import { Server } from 'socket.io'
import router from './routes/router'
import StatsService from './services/stats-service'
dotenv.config()

const app = express()
const server = http.createServer(app)
app.use(express.json())
export const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
})
const PORT = process.env.PORT || 5000
const MONGO_URI =
	process.env.MONGO_URI ||
	'mongodb://Memmix:NEK33irxaS16L2JM@ac-aiaieom-shard-00-00.syhodbc.mongodb.net:27017,ac-aiaieom-shard-00-01.syhodbc.mongodb.net:27017,ac-aiaieom-shard-00-02.syhodbc.mongodb.net:27017/?replicaSet=atlas-ujqlfi-shard-0&ssl=true&authSource=admin'

mongoose
	.connect(MONGO_URI)
	.then(() => console.log('База данных подключена'))
	.catch(err => console.error('Ошибка подключения к БД:', err))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

io.on('connection', socket => {
	console.log('Пользователь подключился')

	socket.on('getStats', async userId => {
		console.log('userId получен на сервере:', userId, typeof userId)
		if (!userId || typeof userId !== 'string') {
			console.error(' Неверный userId')
			return
		}

		socket.join(userId)

		const stats = await StatsService.getStatsByUserId(userId)
		socket.emit('statsUpdate', stats)
	})
	socket.on('workoutCompleted', data => {
		console.log('Тренировка завершена:', data)

		io.emit('updateWorkout', data)
	})
	socket.on('disconnect', () => {})
})

path.join(process.cwd(), 'uploads')
app.use('/api', router)
server.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})
