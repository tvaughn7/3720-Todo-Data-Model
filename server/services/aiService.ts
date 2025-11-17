import OpenAI from 'openai'

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

export class OllamaService {
  private client: OpenAI
  private model: string

  constructor() {
    // Use OpenAI SDK with Ollama's base URL
    this.client = new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      apiKey: 'ollama', // Ollama doesn't require a real API key
    })
    this.model = process.env.OLLAMA_MODEL || 'gpt-oss'
  }

  /**
   * Send chat messages and get streaming response
   */
  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      console.log('🤖 Sending to Ollama:', {
        model: this.model,
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]
      })

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any, // Cast to any for vision support
        stream: true,
        temperature: 0.7,
        // Optimize for speed
        max_tokens: 512,  // Limit response length for faster completion
        top_p: 0.9,       // Slightly reduce sampling space
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    } catch (error: any) {
      console.error('❌ Error in chatStream:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      })
      throw new Error(`Failed to get response from Ollama: ${error.message || error}`)
    }
  }

  /**
   * Send chat messages and get complete response (non-streaming)
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any, // Cast to any for vision support
        stream: false,
        temperature: 0.7,
        // Optimize for speed
        max_tokens: 512,  // Limit response length
        top_p: 0.9,
      })

      return response.choices[0]?.message?.content || 'No response'
    } catch (error) {
      console.error('Error in chat:', error)
      throw new Error(`Failed to get response from Ollama: ${error}`)
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list()
      return response.data.map((model) => model.id)
    } catch (error) {
      console.error('Error listing models:', error)
      return [this.model] // Return default model if listing fails
    }
  }
}
