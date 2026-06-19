import { Router } from 'express'
import { analyzeTrading } from '../controllers/aiController.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)
router.post('/analyze', analyzeTrading)

export default router
