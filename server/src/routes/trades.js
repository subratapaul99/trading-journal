import { Router } from 'express'
import {
  getTrades, getTrade, createTrade,
  updateTrade, deleteTrade, uploadScreenshot,
} from '../controllers/tradeController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()
router.use(protect)

router.route('/')
  .get(getTrades)
  .post(createTrade)

router.route('/:id')
  .get(getTrade)
  .put(updateTrade)
  .delete(deleteTrade)

router.post('/:id/screenshots', upload.single('screenshot'), uploadScreenshot)

export default router
