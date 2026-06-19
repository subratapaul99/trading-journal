import { Router } from 'express'
import { getSummary, getEquityCurve, getMistakes, getCalendar } from '../controllers/analyticsController.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

router.get('/summary', getSummary)
router.get('/equity-curve', getEquityCurve)
router.get('/mistakes', getMistakes)
router.get('/calendar', getCalendar)

export default router
