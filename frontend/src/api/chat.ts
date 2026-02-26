import { api } from './client'
import type { ChatMessage } from '../types'

export const chatApi = {
  getHistory: () => api.get<ChatMessage[]>('/chat/history'),

  clearHistory: () => api.delete<void>('/chat/history'),

  async *sendMessage(message: string): AsyncGenerator<string> {
    const token = localStorage.getItem('cegverzum_token')
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Hiba történt' }))
      throw new Error(err.detail || `HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6)
        try {
          const event = JSON.parse(jsonStr)
          if (event.type === 'chunk') {
            yield event.content
          } else if (event.type === 'error') {
            throw new Error(event.content)
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue
          throw e
        }
      }
    }
  },
}
