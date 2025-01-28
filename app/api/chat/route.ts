import { NextResponse } from 'next/server'

// LLM 配置
const LLM_CONFIG = {
  deepseek: {
    apiKey: 'sk-d432325978774686930b67b3c861c873',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
  }
}

// 统一的消息接口
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 选择使用的 LLM
const CURRENT_LLM = 'deepseek' // 可以改为 'openai'

async function callLLMApi(messages: Message[], llm = CURRENT_LLM) {
  const config = LLM_CONFIG[llm as keyof typeof LLM_CONFIG]
  if (!config) {
    throw new Error('Unsupported LLM')
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API request failed')
  }

  return response.json()
}

export async function POST(request: Request) {
  try {
    const { messages, llm = CURRENT_LLM } = await request.json()

    // 添加系统提示信息
    const systemMessage: Message = {
      role: 'system',
      content: '你是一个有帮助的AI助手。请用简洁、专业的方式回答问题。'
    }

    const allMessages = [systemMessage, ...messages]
    const data = await callLLMApi(allMessages, llm)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
} 