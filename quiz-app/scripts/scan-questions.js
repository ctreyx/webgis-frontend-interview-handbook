/**
 * 面试题扫描脚本
 * 扫描 ../ 目录下所有 .md 文件，生成结构化数据
 * 源文件完全不修改，只做读取和元数据提取
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..', '..') // webgis-frontend-interview-handbook
const OUTPUT = path.resolve(__dirname, '..', 'src', 'data', 'questions.ts')

// 分类中文名映射
const CATEGORY_NAMES = {
  'cesium': 'Cesium 三维',
  'js相关': 'JavaScript 核心',
  'openlayer': 'OpenLayers 二维',
  'pinia': 'Pinia 状态管理',
  'react相关': 'React 深度',
  'ts相关': 'TypeScript',
  'vite': 'Vite 构建',
  'Vue3相关': 'Vue3 原理',
  '大屏自适应': '大屏自适应',
  '天气项目网络层深度解析': '天气项目·网络层',
  '浏览器相关': '浏览器原理',
  '面试如何回答': '面试回答技巧',
  '页面大数据优化方案': '页面性能优化',
}

// 需要跳过的文件
const SKIP_FILES = ['换肤简历.md', '简历亮点.md', '需要学习.md']

/** 去除文件名序号前缀 */
function stripNumber(name) {
  return name.replace(/^\d+(?:\.\d+)?[.\s]*\s*/, '').replace(/\.md$/, '')
}

/** 读取文件第一行作为标题 */
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : ''
}

/** 扫描所有 .md 文件 */
function scanFiles(dir, baseDir) {
  const results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory() && entry.name !== 'quiz-app' && entry.name !== '.git' && entry.name !== 'node_modules') {
      results.push(...scanFiles(fullPath, baseDir))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath)
      const dirName = path.dirname(relativePath)
      const fileName = path.basename(relativePath)

      // 跳过根目录的非面试文件
      if (dirName === '.' && SKIP_FILES.includes(fileName)) continue

      const content = fs.readFileSync(fullPath, 'utf-8')
      const title = extractTitle(content) || stripNumber(fileName)
      const category = dirName === '.' ? '其他' : dirName
      const categoryName = CATEGORY_NAMES[category] || category

      results.push({
        id: relativePath.replace(/[\/\\]/g, '_').replace(/\.md$/, ''),
        title,
        category,
        categoryName,
        fileName,
        relativePath,
        content,
        // 答案内容（标题后的所有内容）
        answer: content.replace(/^#\s+.+\n\n?/, ''),
      })
    }
  }

  return results
}

// 执行扫描
const questions = scanFiles(ROOT_DIR, ROOT_DIR)

// 按分类排序
questions.sort((a, b) => {
  if (a.categoryName !== b.categoryName) return a.categoryName.localeCompare(b.categoryName, 'zh')
  return a.title.localeCompare(b.title, 'zh')
})

// 生成 TypeScript 文件
const tsContent = `/**
 * 自动生成的面试题数据 — 由 scripts/scan-questions.js 生成
 * 请勿手动编辑此文件。运行 npm run scan 重新生成。
 * 生成时间: ${new Date().toISOString()}
 */

export interface Question {
  id: string
  title: string
  category: string
  categoryName: string
  fileName: string
  relativePath: string
  content: string
  answer: string
}

export interface CategoryInfo {
  key: string
  name: string
  count: number
}

export const questions: Question[] = ${JSON.stringify(questions, null, 2)}

export const categories: CategoryInfo[] = (() => {
  const map = new Map<string, number>()
  for (const q of questions) {
    map.set(q.category, (map.get(q.category) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([key, count]) => ({
    key,
    name: questions.find(q => q.category === key)!.categoryName,
    count,
  }))
})()

export const totalQuestions = questions.length
`

fs.writeFileSync(OUTPUT, tsContent, 'utf-8')
console.log(`✅ 扫描完成！共 ${questions.length} 道面试题，${new Set(questions.map(q => q.category)).size} 个分类。`)
console.log(`📁 数据已写入: ${path.relative(__dirname, OUTPUT)}`)
