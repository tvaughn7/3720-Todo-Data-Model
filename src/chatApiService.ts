const API_BASE_URL = 'http://localhost:3100/api'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
    }
  }>
}

export interface ChatRequest {
  messages: ChatMessage[]
}

/**
 * Stream chat messages using Server-Sent Events (SSE)
 */
export async function streamChatMessage(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'content') {
              onChunk(parsed.content)
            } else if (parsed.type === 'done') {
              onComplete()
              return
            } else if (parsed.type === 'error') {
              onError(parsed.error || 'Unknown error')
              return
            }
          } catch (e) {
            // Ignore JSON parse errors for heartbeat or other messages
            console.debug('SSE parse error:', e)
          }
        }
      }
    }

    onComplete()
  } catch (error) {
    console.error('Stream error:', error)
    onError(error instanceof Error ? error.message : 'Failed to stream chat')
  }
}

/**
 * Send chat message (non-streaming fallback)
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.message.content
}
