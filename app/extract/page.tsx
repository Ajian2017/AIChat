'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'

export default function ExtractPage() {
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [completedCount, setCompletedCount] = useState(0)
  const [audioBlobs, setAudioBlobs] = useState<{ name: string; blob: Blob }[]>([])

  const [ffmpeg, setFfmpeg] = useState<any>(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (typeof window === 'undefined') return
      try {
        const FFmpeg = (await import('@ffmpeg/ffmpeg')).FFmpeg
        setFfmpeg(new FFmpeg())
      } catch (error) {
        console.error('Failed to load FFmpeg:', error)
      }
    }
    loadFFmpeg()
  }, [])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setVideoFiles(files)
  }

  const handleDownloadAll = () => {
    if (typeof window === 'undefined') return

    audioBlobs.forEach(({ name, blob }) => {
      const downloadFile = () => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      // 确保在客户端执行
      if (typeof window !== 'undefined') {
        downloadFile()
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFiles.length || isLoading || !ffmpeg) return

    setIsLoading(true)
    setCompletedCount(0)
    setAudioBlobs([])
    
    try {
      const { fetchFile } = await import('@ffmpeg/util')

      // 加载 FFmpeg
      if (!ffmpegLoaded) {
        setProgress('加载 FFmpeg...')
        await ffmpeg.load()
        setFfmpegLoaded(true)
      }

      // 处理每个视频文件
      for (let i = 0; i < videoFiles.length; i++) {
        const video = videoFiles[i]
        setProgress(`处理文件 ${i + 1}/${videoFiles.length}: ${video.name}`)

        // 检查文件大小
        const MAX_SIZE = 100 * 1024 * 1024 // 100MB
        if (video.size > MAX_SIZE) {
          throw new Error(`文件 ${video.name} 大小超过100MB`)
        }

        // 将视频写入 FFmpeg
        await ffmpeg.writeFile(`input${i}.mp4`, await fetchFile(video))

        // 提取音频
        await ffmpeg.exec([
          '-i', `input${i}.mp4`,
          '-vn', // 不要视频
          '-acodec', 'libmp3lame', // 使用 MP3 编码器
          '-q:a', '2', // 音质设置
          `output${i}.mp3`
        ])

        // 读取输出文件
        const data = await ffmpeg.readFile(`output${i}.mp3`)
        const audioBlob = new Blob([data], { type: 'audio/mp3' })
        
        // 生成音频文件名
        const audioName = video.name.replace(/\.[^/.]+$/, '') + '.mp3'
        
        setAudioBlobs(prev => [...prev, { name: audioName, blob: audioBlob }])
        setCompletedCount(i + 1)
      }

      setProgress('')
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : '处理失败，请重试')
      setProgress('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">提取音频</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                选择视频文件（可多选）
              </label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-600
                  hover:file:bg-indigo-100"
              />
              {videoFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  已选择 {videoFiles.length} 个文件
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!videoFiles.length || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : '开始处理'}
            </button>
          </form>

          {progress && (
            <div className="mt-4">
              <div className="text-sm text-gray-600">{progress}</div>
              {completedCount > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  已完成 {completedCount}/{videoFiles.length}
                </div>
              )}
            </div>
          )}

          {audioBlobs.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">处理结果</h2>
              <div className="bg-gray-50 p-4 rounded-md space-y-4">
                <button
                  onClick={handleDownloadAll}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  下载全部音频
                </button>
                <div className="space-y-2">
                  {audioBlobs.map(({ name }, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 