/**
 * Chat utility functions for formatting, parsing, and processing messages
 */

// Markdown-like formatting
export function parseMarkdown(text: string): string {
  // Bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic: *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
  text = text.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Code: `code`
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-primary-400 font-mono text-xs">$1</code>')
  
  // Code blocks: ```code```
  text = text.replace(/```([\s\S]+?)```/g, '<pre class="bg-gray-800 p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>')
  
  // Links: [text](url) or auto-detect URLs
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">$1</a>')
  
  // Auto-detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">$1</a>')
  
  // Line breaks
  text = text.replace(/\n/g, '<br />')
  
  return text
}

// Extract mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }
  
  return Array.from(new Set(mentions)) // Remove duplicates
}

// Format mentions in text
export function formatMentions(text: string, users: { username: string; id: string }[]): string {
  const mentionRegex = /@(\w+)/g
  return text.replace(mentionRegex, (match, username) => {
    const user = users.find(u => u.username === username)
    if (user) {
      return `<span class="mention bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded font-medium" data-user-id="${user.id}">@${username}</span>`
    }
    return match
  })
}

// Extract emojis from text
export function extractEmojis(text: string): string[] {
  const emojiRegex = /:(\w+):/g
  const emojis: string[] = []
  let match
  
  while ((match = emojiRegex.exec(text)) !== null) {
    emojis.push(match[1])
  }
  
  return Array.from(new Set(emojis))
}

// Common emoji mapping
export const EMOJI_MAP: Record<string, string> = {
  'smile': '😊',
  'sad': '😢',
  'love': '❤️',
  'laugh': '😂',
  'wow': '😮',
  'angry': '😠',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'fire': '🔥',
  'heart': '❤️',
  'star': '⭐',
  'check': '✅',
  'cross': '❌',
  'warning': '⚠️',
  'rocket': '🚀',
  'party': '🎉',
  'clap': '👏',
  'wave': '👋',
}

// Format emojis in text
export function formatEmojis(text: string): string {
  const emojiRegex = /:(\w+):/g
  return text.replace(emojiRegex, (match, emojiName) => {
    const emoji = EMOJI_MAP[emojiName.toLowerCase()]
    return emoji || match
  })
}

// Process message text with all formatting
export function processMessageText(text: string, users: { username: string; id: string }[] = []): string {
  let processed = text
  
  // Format mentions
  if (users.length > 0) {
    processed = formatMentions(processed, users)
  }
  
  // Format emojis
  processed = formatEmojis(processed)
  
  // Parse markdown
  processed = parseMarkdown(processed)
  
  return processed
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Check if file is image
export function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return imageExtensions.includes(ext)
}

// Get file type icon
export function getFileTypeIcon(fileType: string): string {
  if (fileType?.startsWith('image/')) return '🖼️'
  if (fileType?.startsWith('video/')) return '🎥'
  if (fileType?.startsWith('audio/')) return '🎵'
  if (fileType?.includes('pdf')) return '📄'
  if (fileType?.includes('zip') || fileType?.includes('rar')) return '📦'
  return '📎'
}

