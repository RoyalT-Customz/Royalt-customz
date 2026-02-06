'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Smile, ChevronLeft, ChevronRight } from 'lucide-react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  position?: 'top' | 'bottom'
}

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
  'Gestures': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Objects': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️'],
  'Symbols': ['✅', '❌', '⭕', '❓', '❔', '❕', '❗', '💯', '🔅', '🔆', '📛', '🔰', '🔱', '⚜️', '🔰', '♻️', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫'],
  'Flags': ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇳', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🎌', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇰', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇬🇸', '🇸🇧', '🇸🇴', '🇿🇦', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇻🇮', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼'],
}

const CATEGORY_ICONS: Record<string, string> = {
  'Smileys': '😀',
  'Gestures': '👋',
  'Objects': '❤️',
  'Symbols': '✅',
  'Flags': '🏳️',
}

export default function EmojiPicker({ onSelect, position = 'top' }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(EMOJI_CATEGORIES)[0])
  const [isOpen, setIsOpen] = useState(false)
  const [categoryScrollLeft, setCategoryScrollLeft] = useState(0)
  const categoryRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji)
    setIsOpen(false)
  }

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryRef.current) {
      const scrollAmount = 100
      const newScrollLeft = categoryScrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      categoryRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
      setCategoryScrollLeft(newScrollLeft)
    }
  }

  useEffect(() => {
    if (isOpen && emojiRef.current) {
      emojiRef.current.scrollTop = 0
    }
  }, [activeCategory, isOpen])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 rounded-lg transition-all"
      >
        <Smile className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-[360px] h-[420px] bg-[#1a1a1a] border border-gray-800/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-xl`}
          >
            {/* Categories Header with Scroll */}
            <div className="relative border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
              <div className="flex items-center">
                {/* Left Scroll Button */}
                <button
                  onClick={() => scrollCategories('left')}
                  className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all flex-shrink-0 z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Categories */}
                <div
                  ref={categoryRef}
                  className="flex-1 flex gap-1 p-2 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                        activeCategory === category
                          ? 'bg-gradient-to-r from-primary-600/30 to-primary-500/20 text-primary-300 shadow-lg shadow-primary-500/20'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                      }`}
                    >
                      <span className="text-base">{CATEGORY_ICONS[category] || '•'}</span>
                      <span>{category}</span>
                    </button>
                  ))}
                </div>

                {/* Right Scroll Button */}
                <button
                  onClick={() => scrollCategories('right')}
                  className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all flex-shrink-0 z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Emojis Grid */}
            <div
              ref={emojiRef}
              className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
              <div className="grid grid-cols-8 gap-1.5">
                {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gradient-to-br hover:from-primary-600/20 hover:to-primary-500/10 rounded-xl transition-all hover:scale-110 active:scale-95 group relative"
                    title={emoji}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-150">{emoji}</span>
                    <div className="absolute inset-0 rounded-xl bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer with Active Category Name */}
            <div className="px-4 py-2.5 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/30 to-gray-800/20">
              <div className="text-xs text-gray-500 font-medium text-center">
                {activeCategory} • {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].length} emojis
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

