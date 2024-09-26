'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [prompt, setPrompt] = useState('')
  const router = useRouter()
  const recentChats = [
    { id: 1, title: "Analyzing Discrepancies Across Databases", time: "1 hour ago" },
    { id: 2, title: "Calculating Total Call Duration", time: "23 hours ago" },
    { id: 3, title: "Transcribing Low-Quality Phone Audio", time: "5 days ago" },
    { id: 4, title: "Colonizing Mars and Dancing Robots", time: "9 days ago" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      router.push(`/chat?message=${encodeURIComponent(prompt)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">EvryAI</h1>
        <span className="text-sm">Professional Plan</span>
      </header>
      
      <main className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">Good afternoon, User</h2>
        
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg mb-8">
          <div className="flex items-center">
            <input
              className="flex-grow bg-transparent outline-none text-white placeholder-gray-500 min-h-[60px] text-lg py-2"
              placeholder="How can EvryAI help you today?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {prompt && (
              <Button type="submit" size="icon" className="ml-2">
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your recent chats</h3>
            <Link href="#" className="text-sm text-gray-400">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentChats.map((chat) => (
              <div key={chat.id} className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{chat.title}</h4>
                <p className="text-sm text-gray-400">{chat.time}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}