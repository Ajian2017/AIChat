import { NextPageContext } from 'next'

function Error({ statusCode }: { statusCode: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {statusCode
            ? `发生了 ${statusCode} 错误`
            : '发生了一个错误'}
        </h2>
        <p className="text-gray-600">抱歉，请稍后再试。</p>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 