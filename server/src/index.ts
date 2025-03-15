import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import router from './routes/router'

dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 5000
const MONGO_URI =
	process.env.MONGO_URI ||
	'mongodb://Memmix:NEK33irxaS16L2JM@ac-aiaieom-shard-00-00.syhodbc.mongodb.net:27017,ac-aiaieom-shard-00-01.syhodbc.mongodb.net:27017,ac-aiaieom-shard-00-02.syhodbc.mongodb.net:27017/?replicaSet=atlas-ujqlfi-shard-0&ssl=true&authSource=admin'

mongoose
	.connect(MONGO_URI)
	.then(() => console.log('База данных подключена'))
	.catch(err => console.error('Ошибка подключения к БД:', err))

app.use('/api', router) // Используем роутер

app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})
