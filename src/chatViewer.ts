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
      <div class="min-h-screen flex flex-col items-center py-10">
        <div class="max-w-4xl w-full mx-auto px-6">
          <!-- Hero Header -->
          <div class="text-center mb-8">
            <h1 class="text-5xl font-black text-[#191308] mb-3 tracking-tight">AI Chat Assistant</h1>
            <p class="text-[#454b66] text-lg">Powered by Ollama • Ask me anything ✨</p>
          </div>

          <!-- Chat Container -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-[#9ca3db]/30 overflow-hidden">
            <!-- Chat Header -->
            <div class="px-6 py-4 border-b border-[#9ca3db]/20 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-[#677db7] to-[#9ca3db] rounded-xl flex items-center justify-center">
                  <span class="text-xl">🤖</span>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-[#191308]">Chat Session</h2>
                  <p class="text-xs text-[#454b66]">Messages are not saved between sessions</p>
                </div>
              </div>
              <button
                id="clear-chat-btn"
                class="inline-flex items-center gap-2 bg-white hover:bg-red-50 text-[#454b66] hover:text-red-600 font-semibold py-2 px-4 rounded-xl transition-all duration-200 border border-[#9ca3db]/50 hover:border-red-300 shadow-sm text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Clear Chat
              </button>
            </div>

            <!-- Messages Container -->
            <div class="h-[400px] overflow-y-auto bg-[#9ca3db]/5" id="messages-container">
              <div class="px-6 py-6 space-y-4">
                <!-- Welcome message -->
                <div class="text-center py-12">
                  <div class="w-16 h-16 bg-gradient-to-br from-[#9ca3db]/30 to-[#677db7]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl">🤖</span>
                  </div>
                  <h3 class="text-lg font-bold text-[#191308] mb-2">Welcome!</h3>
                  <p class="text-[#454b66]">Ask me anything or upload an image for analysis.</p>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <div class="px-6 py-4 border-t border-[#9ca3db]/20 bg-white/50">
              <!-- Image Preview Area -->
              <div id="image-preview" class="hidden mb-4">
                <div class="inline-flex items-center gap-3 bg-[#9ca3db]/10 border border-[#9ca3db]/30 rounded-xl px-3 py-2">
                  <img id="preview-img" class="h-12 w-12 object-cover rounded-lg" />
                  <span class="text-sm text-[#454b66]">Image attached</span>
                  <button
                    id="remove-image"
                    class="text-[#454b66] hover:text-red-500 transition-colors p-1"
                    title="Remove image"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              <div class="flex gap-3 items-center">
                <input
                  type="file"
                  id="image-input"
                  accept="image/*"
                  class="hidden"
                />
                <button
                  id="upload-btn"
                  class="flex-shrink-0 w-11 h-11 bg-white hover:bg-[#9ca3db]/10 text-[#454b66] hover:text-[#677db7] rounded-xl transition-all duration-200 border border-[#9ca3db]/50 shadow-sm hover:shadow-md flex items-center justify-center"
                  title="Upload image for analysis"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </button>
                <div class="flex-1">
                  <textarea
                    id="chat-input"
                    rows="1"
                    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                    class="w-full px-4 py-2.5 bg-[#9ca3db]/10 border border-[#9ca3db]/30 rounded-xl focus:ring-2 focus:ring-[#677db7]/30 focus:border-[#677db7] outline-none transition-all text-[#191308] placeholder-[#454b66]/50 resize-none"
                  ></textarea>
                </div>
                <button
                  id="send-btn"
                  class="flex-shrink-0 inline-flex items-center justify-center bg-gradient-to-r from-[#677db7] to-[#9ca3db] hover:from-[#5a6fa3] hover:to-[#8b93c9] text-white font-semibold h-11 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-[#677db7]/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                >
                  Send
                </button>
              </div>
              <p class="text-xs text-[#454b66]/70 mt-3 flex items-center gap-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Session-only chat • Upload images with 📷 for vision analysis
              </p>
            </div>
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
      imageHtml = `<img src="${imageUrl}" class="max-w-xs rounded-xl mb-2 shadow-md" />`
    }

    let textHtml = ''
    if (text) {
      textHtml = `<div class="message-content whitespace-pre-wrap text-sm">${this.escapeHtml(text)}</div>`
    }

    messageDiv.innerHTML = `
      <div class="max-w-[80%] bg-gradient-to-r from-[#677db7] to-[#9ca3db] text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
        <div class="flex items-start gap-2">
          <div class="flex-1">
            <p class="text-xs font-semibold mb-1 opacity-80">You</p>
            ${imageHtml}
            ${textHtml}
          </div>
          <span class="text-lg">👤</span>
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
    const bgColor = isUser ? 'bg-gradient-to-r from-[#677db7] to-[#9ca3db] text-white' : 'bg-white text-[#191308] border border-[#9ca3db]/20'
    const alignment = isUser ? 'justify-end' : 'justify-start'
    const icon = isUser ? '👤' : '🤖'
    const roundedClass = isUser ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'

    messageDiv.className = `flex ${alignment}`
    messageDiv.innerHTML = `
      <div class="max-w-[80%] ${bgColor} ${roundedClass} px-4 py-3 shadow-lg">
        <div class="flex items-start gap-2">
          ${!isUser ? `<span class="text-lg">${icon}</span>` : ''}
          <div class="flex-1">
            <p class="text-xs font-semibold mb-1 ${isUser ? 'opacity-80' : 'text-[#454b66]'}">${isUser ? 'You' : 'Assistant'}</p>
            <div class="message-content whitespace-pre-wrap text-sm prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'}">${
              isUser ? this.escapeHtml(content) : marked.parse(content)
            }</div>
          </div>
          ${isUser ? `<span class="text-lg">${icon}</span>` : ''}
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
      this.sendButton.textContent = 'Thinking...'
    } else {
      this.sendButton.textContent = 'Send'
    }
  }

  private handleClearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = []
      const contentWrapper = this.messagesContainer.querySelector('.space-y-4')!
      contentWrapper.innerHTML = `
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-gradient-to-br from-[#9ca3db]/30 to-[#677db7]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">🤖</span>
          </div>
          <h3 class="text-lg font-bold text-[#191308] mb-2">Welcome!</h3>
          <p class="text-[#454b66]">Ask me anything or upload an image for analysis.</p>
        </div>
      `
    }
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'flex justify-center'
    errorDiv.innerHTML = `
      <div class="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 shadow-md max-w-[80%]">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <p class="text-sm font-semibold">Error</p>
            <p class="text-sm">${this.escapeHtml(message)}</p>
          </div>
        </div>
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
