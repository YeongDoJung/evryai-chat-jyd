// src/app/chat/page.tsx
import ChatInterface from './ChatInterface'

export default function ChatPage({ searchParams }: { searchParams: { [key: string]: string } }) {
  const initialMessage = searchParams.message || ''

  return <ChatInterface initialMessage={initialMessage} />
}