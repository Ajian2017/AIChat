'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../lib/firebase'
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css' // 可以选择其他主题样式

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 自定义 Markdown 消息组件
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      className="prose prose-sm max-w-none dark:prose-invert"
      components={{
        // 自定义代码块渲染
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          
          if (!inline && language) {
            const highlighted = hljs.highlight(children.toString(), {
              language,
              ignoreIllegals: true
            }).value
            
            return (
              <pre className="!mt-2 !mb-2">
                <code
                  className={`hljs language-${language} block overflow-x-auto p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                  {...props}
                />
              </pre>
            )
          }
          
          return (
            <code className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800" {...props}>
              {children}
            </code>
          )
        },
        // 自定义段落渲染
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        // 自定义列表渲染
        ul({ children }) {
          return <ul className="list-disc ml-4 mb-2">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal ml-4 mb-2">{children}</ol>
        },
        // 自定义标题渲染
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-2">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-base font-bold mb-2">{children}</h3>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentLLM, setCurrentLLM] = useState('deepseek')
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
      } else {
        loadConversations(user.uid)
      }
    })

    return () => unsubscribe()
  }, [router])

  const loadConversations = async (userId: string) => {
    try {
      // 首先只按 userId 查询
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(q)
      const convs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // 在客户端进行排序
      convs.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setConversations(convs)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const createNewConversation = async () => {
    if (!auth.currentUser) return

    const docRef = await addDoc(collection(db, 'conversations'), {
      userId: auth.currentUser.uid,
      title: '新对话',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    setCurrentConversationId(docRef.id)
    setMessages([])
    await loadConversations(auth.currentUser.uid)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !auth.currentUser) return

    let conversationId = currentConversationId
    if (!conversationId) {
      const docRef = await addDoc(collection(db, 'conversations'), {
        userId: auth.currentUser.uid,
        title: input.trim().substring(0, 30),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      conversationId = docRef.id
      setCurrentConversationId(conversationId)
    }

    const newMessage: Message = {
      role: 'user',
      content: input.trim()
    }

    // 保存用户消息到 Firestore
    await addDoc(collection(db, `conversations/${conversationId}/messages`), {
      ...newMessage,
      createdAt: new Date().toISOString()
    })

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          llm: currentLLM
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      }

      // 保存 AI 响应到 Firestore
      await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        ...aiResponse,
        createdAt: new Date().toISOString()
      })

      // 更新对话标题
      await updateDoc(doc(db, 'conversations', conversationId), {
        updatedAt: new Date().toISOString()
      })

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了一些错误。请稍后再试。'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <button
          onClick={createNewConversation}
          className="w-full px-4 py-2 mb-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          新对话
        </button>
        <div className="space-y-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversationId(conv.id)}
              className={`w-full px-4 py-2 text-left rounded ${
                currentConversationId === conv.id ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-900 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">AI 助手</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={currentLLM}
                onChange={(e) => setCurrentLLM(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="deepseek">Deepseek</option>
                <option value="openai">ChatGPT</option>
              </select>
              <button
                onClick={() => auth.signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                退出登录
              </button>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                {message.role === 'assistant' ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 rounded-lg px-4 py-2 shadow-sm">
                正在思考...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 