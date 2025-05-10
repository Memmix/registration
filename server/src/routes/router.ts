import { Router } from 'express'
import UserController from '../controllers/user-controller'
import { upload } from '../middlewares/upload'
import StatsController from './../controllers/stats-controller'
import WorkoutController from './../controllers/workout-controller'
const router = Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/refresh-token', UserController.refreshToken)
router.post('/logout', UserController.logout)
router.get('/currentUser/:userId', UserController.getCurrentUser)
router.post('/upload/:userId', upload.single('profileImage'), (req, res) => {
	UserController.uploadProfileImage(req, res)
})
router.get('/workouts', (req, res) => {
	WorkoutController.getAll(req, res)
})
router.get('/workouts/user/:userId', (req, res) => {
	WorkoutController.getByUserId(req, res)
})
router.post('/workouts', (req, res) => {
	WorkoutController.create(req, res)
})
router.delete('/workouts/:userId/:exerciseTitle', (req, res) => {
	WorkoutController.deleteExerciseByUserId(req, res)
})
router.post('/workouts/complete', (req, res) => {
	WorkoutController.markCompleted(req, res)
})
router.get('/:userId', (req, res) => {
	StatsController.getStats(req, res)
})
router.post('/:userId/update', (req, res) => {
	StatsController.updateExerciseDay(req, res)
})
router.post('/stats', (req, res) => {
	StatsController.createStats(req, res)
})
router.delete('/:userId/delete/:exerciseTitle', (req, res) => {
	StatsController.deleteExerciseByUserId(req, res)
})
router.patch('/users/:userId', (req, res) => {
	UserController.updateProfile(req, res)
})
export default router
