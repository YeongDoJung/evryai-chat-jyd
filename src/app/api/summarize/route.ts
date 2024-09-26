import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
  const { messages } = await req.json()

  const concatenatedMessages = messages.map((msg: { message: string }) => msg.message).join(' ');

  const summarize = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "system", 
            content: "Summarize the following chat into a sentence with less than 50 characters, note that detect language and return summary as same language"
        },
        {
            role: "user",
            content : concatenatedMessages
        }],
    max_tokens : 50,
  })

  const summary = summarize.choices[0]?.message?.content?.trim() || 'Unable to summarize';

  return NextResponse.json({ summary })
  }
  catch(error) {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "This endpoint only supports POST requests" }, { status: 405 })
}