// components/ui/spinner.tsx

import React from 'react'
import { Star, Sparkles } from 'lucide-react'

export const Spinner = () => (
  <div className="flex items-center justify-center space-x-4">
    <Star className="text-yellow-400 w-8 h-8 animate-spin-slow" />
    <Sparkles className="text-pink-400 w-8 h-8 animate-pulse" />
    <Star className="text-purple-400 w-8 h-8 animate-spin-reverse" />
  </div>
)
