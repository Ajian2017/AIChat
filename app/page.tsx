import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            与AI对话，探索无限可能
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            基于先进的人工智能技术，为您提供智能、自然、专业的对话体验
          </p>
          <div className="mt-10">
            <Link
              href="/chat"
              className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
            >
              开始对话
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-indigo-100 p-3">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="mt-6 text-lg font-semibold text-gray-900">快速响应</h2>
            <p className="mt-2 text-base text-gray-600 text-center">
              毫秒级响应速度，让对话流畅自然
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-indigo-100 p-3">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="mt-6 text-lg font-semibold text-gray-900">安全可靠</h2>
            <p className="mt-2 text-base text-gray-600 text-center">
              数据加密传输，保护您的隐私安全
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-indigo-100 p-3">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 className="mt-6 text-lg font-semibold text-gray-900">持续进化</h2>
            <p className="mt-2 text-base text-gray-600 text-center">
              AI模型不断优化，能力持续提升
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
