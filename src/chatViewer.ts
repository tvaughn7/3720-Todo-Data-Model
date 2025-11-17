import { streamChatMessage, type ChatMessage } from './chatApiService'

export class ChatViewer {
  private container: HTMLElement
  private messages: ChatMessage[] = []
  private messagesContainer!: HTMLElement
  private inputTextarea!: HTMLTextAreaElement
  private sendButton!: HTMLButtonElement
  private isStreaming = false

  constructor(container: HTMLElement) {
    this.container = container
    this.render()
    this.attachEventListeners()
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex flex-col">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-4xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  🤖 AI Chat Assistant
                </h1>
                <p class="text-sm text-gray-500 mt-1">Powered by Ollama (gpt-oss)</p>
              </div>
              <button
                id="clear-chat-btn"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="flex-1 overflow-y-auto" id="messages-container">
          <div class="max-w-4xl mx-auto px-4 py-6 space-y-4">
            <!-- Welcome message -->
            <div class="text-center py-8">
              <div class="inline-block bg-blue-100 text-blue-800 px-6 py-3 rounded-lg">
                <p class="font-medium">👋 Welcome! Ask me anything.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="bg-white border-t border-gray-200 shadow-lg">
          <div class="max-w-4xl mx-auto px-4 py-4">
            <div class="flex gap-3">
              <textarea
                id="chat-input"
                rows="3"
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              ></textarea>
              <button
                id="send-btn"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send 📤
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Session-only chat • Messages are not saved</p>
          </div>
        </div>
      </div>
    `

    // Store references
    this.messagesContainer = this.container.querySelector('#messages-container')!
    this.inputTextarea = this.container.querySelector('#chat-input')!
    this.sendButton = this.container.querySelector('#send-btn')!
  }

  private attachEventListeners(): void {
    // Send button
    this.sendButton.addEventListener('click', () => this.handleSend())

    // Enter to send, Shift+Enter for new line
    this.inputTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.handleSend()
      }
    })

    // Clear chat button
    const clearBtn = this.container.querySelector('#clear-chat-btn')!
    clearBtn.addEventListener('click', () => this.handleClearChat())
  }

  private async handleSend(): Promise<void> {
    const userMessage = this.inputTextarea.value.trim()

    if (!userMessage || this.isStreaming) {
      return
    }

    // Clear input
    this.inputTextarea.value = ''

    // Add user message to array and display it
    this.addMessage('user', userMessage)
    this.displayUserMessage(userMessage)

    // Disable input during streaming
    this.setInputState(false)

    // Prepare messages for API
    const messages: ChatMessage[] = this.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Create placeholder for assistant response
    const assistantMessageId = this.createAssistantMessagePlaceholder()

    // Stream the response
    let fullResponse = ''

    await streamChatMessage(
      messages,
      // onChunk
      (chunk: string) => {
        fullResponse += chunk
        this.updateAssistantMessage(assistantMessageId, fullResponse)
      },
      // onComplete
      () => {
        this.addMessage('assistant', fullResponse)
        // Keep the placeholder as the final message by removing its ID
        const messageElement = this.container.querySelector(`#${assistantMessageId}`)
        if (messageElement) {
          messageElement.removeAttribute('id')
        }
        this.setInputState(true)
        this.inputTextarea.focus()
      },
      // onError
      (error: string) => {
        this.removeMessageElement(assistantMessageId)
        this.showError(error)
        this.setInputState(true)
        this.inputTextarea.focus()
      }
    )
  }

  private addMessage(role: 'user' | 'assistant', content: string): void {
    this.messages.push({ role, content })
  }

  private displayUserMessage(content: string): void {
    // Remove welcome message if exists
    const welcomeMsg = this.messagesContainer.querySelector('.text-center')
    if (welcomeMsg) {
      welcomeMsg.remove()
    }

    const messageElement = this.createMessageElement('user', content)
    const contentWrapper = this.messagesContainer.querySelector('.space-y-4')!
    contentWrapper.appendChild(messageElement)
    this.scrollToBottom()
  }

  private createAssistantMessagePlaceholder(): string {
    const messageId = `msg-${Date.now()}`
    const messageElement = this.createMessageElement('assistant', '', messageId)
    
    // Remove welcome message if exists
    const welcomeMsg = this.messagesContainer.querySelector('.text-center')
    if (welcomeMsg) {
      welcomeMsg.remove()
    }

    const contentWrapper = this.messagesContainer.querySelector('.space-y-4')!
    contentWrapper.appendChild(messageElement)
    this.scrollToBottom()

    return messageId
  }

  private updateAssistantMessage(messageId: string, content: string): void {
    const messageElement = this.container.querySelector(`#${messageId}`)
    if (messageElement) {
      const contentElement = messageElement.querySelector('.message-content')
      if (contentElement) {
        contentElement.textContent = content
        this.scrollToBottom()
      }
    }
  }

  private removeMessageElement(messageId: string): void {
    const messageElement = this.container.querySelector(`#${messageId}`)
    if (messageElement) {
      messageElement.remove()
    }
  }

  private createMessageElement(
    role: 'user' | 'assistant',
    content: string,
    id?: string
  ): HTMLElement {
    const messageDiv = document.createElement('div')
    if (id) {
      messageDiv.id = id
    }

    const isUser = role === 'user'
    const bgColor = isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
    const alignment = isUser ? 'justify-end' : 'justify-start'
    const icon = isUser ? '👤' : '🤖'

    messageDiv.className = `flex ${alignment}`
    messageDiv.innerHTML = `
      <div class="max-w-[80%] ${bgColor} rounded-lg px-4 py-3 shadow-sm">
        <div class="flex items-start gap-2">
          <span class="text-lg">${icon}</span>
          <div class="flex-1">
            <p class="text-sm font-semibold mb-1">${isUser ? 'You' : 'Assistant'}</p>
            <div class="message-content whitespace-pre-wrap text-sm">${this.escapeHtml(
              content
            )}</div>
          </div>
        </div>
      </div>
    `

    return messageDiv
  }

  private setInputState(enabled: boolean): void {
    this.isStreaming = !enabled
    this.inputTextarea.disabled = !enabled
    this.sendButton.disabled = !enabled

    if (!enabled) {
      this.sendButton.textContent = 'Streaming... ⏳'
    } else {
      this.sendButton.textContent = 'Send 📤'
    }
  }

  private handleClearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = []
      const contentWrapper = this.messagesContainer.querySelector('.space-y-4')!
      contentWrapper.innerHTML = `
        <div class="text-center py-8">
          <div class="inline-block bg-blue-100 text-blue-800 px-6 py-3 rounded-lg">
            <p class="font-medium">👋 Welcome! Ask me anything.</p>
          </div>
        </div>
      `
    }
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'flex justify-center'
    errorDiv.innerHTML = `
      <div class="bg-red-100 text-red-800 rounded-lg px-4 py-3 shadow-sm max-w-[80%]">
        <p class="text-sm font-semibold mb-1">❌ Error</p>
        <p class="text-sm">${this.escapeHtml(message)}</p>
      </div>
    `

    const contentWrapper = this.messagesContainer.querySelector('.space-y-4')!
    contentWrapper.appendChild(errorDiv)
    this.scrollToBottom()
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
    }, 0)
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
