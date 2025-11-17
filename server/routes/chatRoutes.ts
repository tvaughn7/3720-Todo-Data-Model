import { Router } from 'express'
import {
  sendChatMessage,
  streamChatMessage,
  getAvailableModels,
} from '../controllers/chatController.js'

const router = Router()

// Streaming endpoint (primary)
router.post('/stream', streamChatMessage)

// Non-streaming endpoint (fallback)
router.post('/', sendChatMessage)

// Get available models
router.get('/models', getAvailableModels)

export default router
