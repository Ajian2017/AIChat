import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-900">页面未找到</h2>
        <p className="text-gray-600">抱歉，您访问的页面不存在。</p>
        <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
} 