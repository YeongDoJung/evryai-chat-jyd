'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, PlusCircle, Menu } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  message: string
}

interface ChatInterfaceProps {
  initialMessage: string
}

interface SavedChat {
  id: string
  title: string
  messages: ChatMessage[]
}

interface SidebarProps {
  savedChats: SavedChat[]
  onNewChat: () => void
  onLoadChat: (messages: ChatMessage[]) => void
}

function Sidebar({ savedChats, onNewChat, onLoadChat }: SidebarProps) {
  return (
    <div className="bg-gray-800 w-64 h-full overflow-y-auto">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 mb-4"
        >
          New Chat
        </button>
        <h2 className="text-lg font-semibold mb-2">Recent Chats</h2>
        {savedChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onLoadChat(chat.messages)}
            className="w-full text-left p-2 hover:bg-gray-700 rounded-md mb-1"
          >
            {chat.title}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const focusInput = useCallback(() => {
    const input = document.getElementById('chat-input') as HTMLInputElement | null
    if (input) {
      input.focus()
    }
  }, [])

  useEffect(() => {
    if (initialMessage) {
      const userMessage: ChatMessage = { id: uuidv4(), sender: 'user', message: initialMessage }
      setChatHistory([userMessage])
      handleAIResponse(initialMessage)
    }
    focusInput()
  }, [initialMessage, focusInput])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  useEffect(() => {
    const loadedChats = JSON.parse(localStorage.getItem('savedChats') || '[]')
    setSavedChats(loadedChats)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      const newMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'user',
        message: message.trim(),
      }
      setChatHistory((prev) => [...prev, newMessage])
      setMessage('')
      requestAnimationFrame(() => {
        focusInput()
      })
      await handleAIResponse(newMessage.message)
    }
  }

  const handleAIResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true)
    const aiMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'ai',
      message: '',
    }
    setChatHistory((prev) => [...prev, aiMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        const chunkValue = decoder.decode(value)
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id ? { ...msg, message: msg.message + chunkValue } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      setChatHistory((prev) => [
        ...prev,
        { id: aiMessage.id, sender: 'ai', message: 'Sorry, something went wrong.' },
      ])
    } finally {
      setIsLoading(false)
      requestAnimationFrame(() => {
        focusInput()
      })
    }
  }, [focusInput])

  const summarizeChat = async (messages: ChatMessage[]): Promise<string> => {
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        console.error(response)
        throw new Error('Failed to summarize chat')
      }

      const { summary } = await response.json()
      return summary
    } catch (error) {
      console.error('Error summarizing chat:', error)
      return 'New Chat'
    }
  }

  const handleNewChat = async () => {
    if (chatHistory.length > 0) {
      const summary = await summarizeChat(chatHistory);
      const newSavedChat: SavedChat = {
        id: uuidv4(),
        title: summary,
        messages: chatHistory,
      };
  
      const updatedSavedChats = [...savedChats, newSavedChat];
      setSavedChats(updatedSavedChats);
      // localStorage.setItem('savedChats', JSON.stringify(updatedSavedChats));
      
      await saveChatsToServer(updatedSavedChats);

    }
  
    setChatHistory([]);
    setMessage('');
    focusInput();
    setIsSidebarOpen(false);
  };

  const handleLoadChat = (messages: ChatMessage[]) => {
    setChatHistory(messages)
    setIsSidebarOpen(false)
  }

  const saveChatsToServer = async (updatedSavedChats: SavedChat[]) => {
    try {
      const response = await fetch('/api/save-chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSavedChats),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save chats');
      }
  
    } catch (error) {
      console.error('Error saving chats to server:', error);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {isSidebarOpen && (
        <Sidebar
          savedChats={savedChats}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
        />
      )}
      <div className="flex flex-col flex-grow">
        <header className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-full hover:bg-gray-800"
            >
              <Menu size={24} />
            </button>
            <Image src="/logo.png" alt="EvryAI Logo" width={120} height={32} />
          </div>
          <div>
            <button
              onClick={handleNewChat}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <PlusCircle size={24} />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-auto p-4 space-y-6">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  chat.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 max-w-[80%] rounded-2xl p-4">
                <p className="text-sm">AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        <footer className="p-4 border-t border-gray-800">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center space-x-2">
            <input
              id="chat-input"
              className="flex-grow bg-gray-800 border-none rounded-full py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Reply to EvryAI..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  )
}