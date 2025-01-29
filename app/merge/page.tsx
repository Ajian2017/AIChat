'use client'

import { useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

type FileType = 'video' | 'audio'

interface MediaFile {
  file: File
  type: FileType
}

export default function MergePage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [currentType, setCurrentType] = useState<FileType>('video')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)

  // 初始化 FFmpeg
  const ffmpeg = new FFmpeg()
  let ffmpegLoaded = false

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newMediaFiles = files.map(file => ({ file, type: currentType }))
    setMediaFiles(prev => [...prev, ...newMediaFiles])
  }

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDownload = () => {
    if (!outputBlob) return
    const url = URL.createObjectURL(outputBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `合并${currentType === 'video' ? '视频' : '音频'}_${Date.now()}.${currentType === 'video' ? 'mp4' : 'mp3'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mediaFiles.length < 2 || isLoading) return

    setIsLoading(true)
    try {
      // 加载 FFmpeg
      if (!ffmpegLoaded) {
        setProgress('加载 FFmpeg...')
        await ffmpeg.load()
        ffmpegLoaded = true
      }

      // 创建合并文件列表
      setProgress('准备文件...')
      let fileList = ''
      for (let i = 0; i < mediaFiles.length; i++) {
        const { file, type } = mediaFiles[i]
        const ext = type === 'video' ? 'mp4' : 'mp3'
        await ffmpeg.writeFile(`input${i}.${ext}`, await fetchFile(file))
        fileList += `file 'input${i}.${ext}'\n`
      }
      await ffmpeg.writeFile('files.txt', fileList)

      // 执行合并命令
      setProgress('合并中...')
      if (currentType === 'video') {
        await ffmpeg.exec([
          '-f', 'concat',
          '-safe', '0',
          '-i', 'files.txt',
          '-c', 'copy',
          'output.mp4'
        ])
      } else {
        await ffmpeg.exec([
          '-f', 'concat',
          '-safe', '0',
          '-i', 'files.txt',
          '-c:a', 'libmp3lame',
          '-q:a', '2',
          'output.mp3'
        ])
      }

      // 读取输出文件
      setProgress('生成结果...')
      const outputFile = currentType === 'video' ? 'output.mp4' : 'output.mp3'
      const mimeType = currentType === 'video' ? 'video/mp4' : 'audio/mp3'
      const data = await ffmpeg.readFile(outputFile)
      const blob = new Blob([data], { type: mimeType })
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">合并媒体文件</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择文件类型
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentType('video')
                      setMediaFiles([])
                    }}
                    className={`px-4 py-2 rounded-md ${
                      currentType === 'video'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    视频
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentType('audio')
                      setMediaFiles([])
                    }}
                    className={`px-4 py-2 rounded-md ${
                      currentType === 'audio'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    音频
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  选择{currentType === 'video' ? '视频' : '音频'}文件（可多选）
                </label>
                <input
                  type="file"
                  accept={currentType === 'video' ? 'video/*' : 'audio/*'}
                  multiple
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-600
                    hover:file:bg-indigo-100"
                />
                <p className="mt-2 text-sm text-gray-500">
                  注意：文件将按照选择顺序合并
                </p>
              </div>

              {mediaFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">已选择的文件：</h3>
                  <div className="space-y-2">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {index + 1}. {media.type === 'video' ? '🎥' : '🎵'} {media.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={mediaFiles.length < 2 || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : '开始合并'}
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
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  下载合并文件
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 