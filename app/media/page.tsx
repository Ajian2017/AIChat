'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/firebase'

export default function MediaPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)
  const [progress, setProgress] = useState<string>('')
  const [ffmpeg, setFfmpeg] = useState<any>(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const router = useRouter()

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

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setAudioFile(selectedFile)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setVideoFile(selectedFile)
    }
  }

  const handleDownload = () => {
    if (typeof window === 'undefined' || !outputBlob) return

    const downloadFile = () => {
      const url = URL.createObjectURL(outputBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `合成视频_${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // 确保在客户端执行
    if (typeof window !== 'undefined') {
      downloadFile()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile || !videoFile || isLoading || !ffmpeg) return

    setIsLoading(true)
    try {
      const { fetchFile } = await import('@ffmpeg/util')

      // 检查文件大小
      const MAX_SIZE = 100 * 1024 * 1024 // 100MB
      if (audioFile.size > MAX_SIZE || videoFile.size > MAX_SIZE) {
        throw new Error('文件大小不能超过100MB')
      }

      // 加载 FFmpeg
      if (!ffmpegLoaded) {
        setProgress('加载 FFmpeg...')
        await ffmpeg.load()
        setFfmpegLoaded(true)
      }

      setProgress('处理文件...')
      // 将文件写入 FFmpeg 虚拟文件系统
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      await ffmpeg.writeFile('input.mp3', await fetchFile(audioFile))

      // 执行合成命令
      setProgress('合成中...')
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-i', 'input.mp3',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-map', '0:v',
        '-map', '1:a',
        '-shortest',
        'output.mp4'
      ])

      // 读取输出文件
      setProgress('生成结果...')
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      setOutputBlob(blob)
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">音视频合成</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                选择音频文件
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-600
                  hover:file:bg-indigo-100"
              />
              
              <label className="block text-sm font-medium text-gray-700">
                选择视频文件
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-600
                  hover:file:bg-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={!audioFile || !videoFile || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : '开始处理'}
            </button>
          </form>

          {progress && (
            <div className="mt-4 text-sm text-gray-600">
              {progress}
            </div>
          )}

          {outputBlob && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">处理结果</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <button
                  onClick={handleDownload}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  下载处理结果
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 