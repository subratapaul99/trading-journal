// ─── journal.js ──────────────────────────────────────────────
import { Router } from 'express'
import { getEntries, createEntry, updateEntry, deleteEntry } from '../controllers/journalController.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)
router.route('/').get(getEntries).post(createEntry)
router.route('/:id').put(updateEntry).delete(deleteEntry)

export default router
