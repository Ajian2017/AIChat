'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser)
    return () => unsubscribe()
  }, [])

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              AI 助手
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/chat' || pathname === '/AIChat/chat'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  AI 对话
                </Link>
                <Link
                  href="/media"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/media' || pathname === '/AIChat/media'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  音视频合成
                </Link>
                <Link
                  href="/extract"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/extract' || pathname === '/AIChat/extract'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  提取音频
                </Link>
                <Link
                  href="/merge"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/merge' || pathname === '/AIChat/merge'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  合并音视频
                </Link>
                <button
                  onClick={() => auth.signOut()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 