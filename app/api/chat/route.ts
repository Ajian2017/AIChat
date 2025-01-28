import { NextResponse } from 'next/server'

// const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_KEY = 'sk-d432325978774686930b67b3c861c873'
const API_URL = 'https://api.deepseek.com/v1/chat/completions'  // 请根据实际的 Deepseek API 端点调整

export async function POST(request: Request) {
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: 'Deepseek API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { messages } = await request.json()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',  // 根据实际的模型名称调整
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
} 