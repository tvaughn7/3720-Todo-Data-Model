import { Request, Response } from 'express'
import { OllamaService } from '../services/aiService.js'

const ollamaService = new OllamaService()

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
    }
  }>
}

interface ChatRequest {
  messages: ChatMessage[]
}

/**
 * POST /api/chat/stream
 * Stream chat responses using Server-Sent Events (SSE)
 */
export async function streamChatMessage(req: Request, res: Response) {
  try {
    const { messages }: ChatRequest = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Send initial connection message
    res.write('data: {"type": "connected"}\n\n')

    try {
      // Stream the response from Ollama
      for await (const chunk of ollamaService.chatStream(messages)) {
        // Send each chunk as SSE data
        const data = JSON.stringify({ type: 'content', content: chunk })
        res.write(`data: ${data}\n\n`)
      }

      // Send completion message
      res.write('data: {"type": "done"}\n\n')
      res.end()
    } catch (streamError) {
      console.error('Stream error:', streamError)
      const errorData = JSON.stringify({
        type: 'error',
        error: 'Failed to stream response from AI model',
      })
      res.write(`data: ${errorData}\n\n`)
      res.end()
    }
  } catch (error) {
    console.error('Error in streamChatMessage:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' })
    }
  }
}

/**
 * POST /api/chat
 * Non-streaming chat endpoint (fallback)
 */
export async function sendChatMessage(req: Request, res: Response) {
  try {
    const { messages }: ChatRequest = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    const response = await ollamaService.chat(messages)

    res.json({
      message: {
        role: 'assistant',
        content: response,
      },
    })
  } catch (error) {
    console.error('Error in sendChatMessage:', error)
    res.status(500).json({ error: 'Failed to get response from AI model' })
  }
}

/**
 * GET /api/chat/models
 * Get available models
 */
export async function getAvailableModels(req: Request, res: Response) {
  try {
    const models = await ollamaService.listModels()
    res.json({ models })
  } catch (error) {
    console.error('Error in getAvailableModels:', error)
    res.status(500).json({ error: 'Failed to fetch available models' })
  }
}
