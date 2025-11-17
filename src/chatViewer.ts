import { streamChatMessage, type ChatMessage } from './chatApiService'
import { marked } from 'marked'

// Configure marked for better code rendering
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
})

export class ChatViewer {
  private container: HTMLElement
  private messages: ChatMessage[] = []
  private messagesContainer!: HTMLElement
  private inputTextarea!: HTMLTextAreaElement
  private sendButton!: HTMLButtonElement
  private imageInput!: HTMLInputElement
  private imagePreview!: HTMLElement
  private currentImage: string | null = null
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
            <!-- Image Preview Area -->
            <div id="image-preview" class="hidden mb-3 relative">
              <img id="preview-img" class="max-h-32 rounded-lg border-2 border-blue-500" />
              <button
                id="remove-image"
                class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div class="flex gap-3">
              <input
                type="file"
                id="image-input"
                accept="image/*"
                class="hidden"
              />
              <button
                id="upload-btn"
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload image"
              >
                📷
              </button>
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
            <p class="text-xs text-gray-500 mt-2">Session-only chat • Messages are not saved • 📷 Upload images for vision analysis</p>
          </div>
        </div>
      </div>
    `

    // Store references
    this.messagesContainer = this.container.querySelector('#messages-container')!
    this.inputTextarea = this.container.querySelector('#chat-input')!
    this.sendButton = this.container.querySelector('#send-btn')!
    this.imageInput = this.container.querySelector('#image-input')!
    this.imagePreview = this.container.querySelector('#image-preview')!
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

    // Image upload button
    const uploadBtn = this.container.querySelector('#upload-btn')!
    uploadBtn.addEventListener('click', () => this.imageInput.click())

    // Image input change
    this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e))

    // Remove image button
    const removeBtn = this.container.querySelector('#remove-image')!
    removeBtn.addEventListener('click', () => this.removeImage())
  }

  private async handleSend(): Promise<void> {
    const userMessage = this.inputTextarea.value.trim()

    if ((!userMessage && !this.currentImage) || this.isStreaming) {
      return
    }

    // Clear input
    this.inputTextarea.value = ''

    // Build message content
    let messageContent: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>
    
    if (this.currentImage) {
      // Message with image
      messageContent = [
        {
          type: 'image_url',
          image_url: {
            url: this.currentImage
          }
        }
      ]
      if (userMessage) {
        messageContent.unshift({
          type: 'text',
          text: userMessage
        })
      } else {
        messageContent.unshift({
          type: 'text',
          text: 'What do you see in this image?'
        })
      }
    } else {
      // Text-only message
      messageContent = userMessage
    }

    // Add user message to array and display it
    this.addMessage('user', messageContent)
    this.displayUserMessage(userMessage, this.currentImage)

    // Clear image after sending
    this.removeImage()

    // Disable input during streaming
    this.setInputState(false)

    // Prepare messages for API - convert to simplified format
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

  private handleImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file && file.type.startsWith('image/')) {
      // Compress and resize image before encoding
      this.compressImage(file, (compressedBase64) => {
        this.currentImage = compressedBase64
        
        // Show preview
        const previewImg = this.container.querySelector('#preview-img') as HTMLImageElement
        previewImg.src = compressedBase64
        this.imagePreview.classList.remove('hidden')
      })
    }
  }

  private compressImage(file: File, callback: (base64: string) => void): void {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Max dimensions to keep image reasonable size
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height
            height = MAX_HEIGHT
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with compression (0.7 quality for JPEG)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
        callback(compressedBase64)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  private removeImage(): void {
    this.currentImage = null
    this.imagePreview.classList.add('hidden')
    this.imageInput.value = ''
  }

  private addMessage(role: 'user' | 'assistant', content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>): void {
    this.messages.push({ role, content })
  }

  private displayUserMessage(text: string, imageUrl: string | null = null): void {
    // Remove welcome message if exists
    const welcomeMsg = this.messagesContainer.querySelector('.text-center')
    if (welcomeMsg) {
      welcomeMsg.remove()
    }

    const messageElement = this.createUserMessageElement(text, imageUrl)
    const contentWrapper = this.messagesContainer.querySelector('.space-y-4')!
    contentWrapper.appendChild(messageElement)
    this.scrollToBottom()
  }

  private createUserMessageElement(text: string, imageUrl: string | null): HTMLElement {
    const messageDiv = document.createElement('div')
    messageDiv.className = 'flex justify-end'

    let imageHtml = ''
    if (imageUrl) {
      imageHtml = `<img src="${imageUrl}" class="max-w-xs rounded-lg mb-2 border-2 border-white" />`
    }

    let textHtml = ''
    if (text) {
      textHtml = `<div class="message-content whitespace-pre-wrap text-sm">${this.escapeHtml(text)}</div>`
    }

    messageDiv.innerHTML = `
      <div class="max-w-[80%] bg-blue-500 text-white rounded-lg px-4 py-3 shadow-sm">
        <div class="flex items-start gap-2">
          <span class="text-lg">👤</span>
          <div class="flex-1">
            <p class="text-sm font-semibold mb-1">You</p>
            ${imageHtml}
            ${textHtml}
          </div>
        </div>
      </div>
    `

    return messageDiv
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
        // Render markdown for assistant messages
        contentElement.innerHTML = marked.parse(content) as string
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
            <div class="message-content whitespace-pre-wrap text-sm prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}">${
              isUser ? this.escapeHtml(content) : marked.parse(content)
            }</div>
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
