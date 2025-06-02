import React from 'react'
import { Github } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2024 BWGC Golf Club. Tournament analytics powered by data and friendship.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/yourusername/bwgc-golf-stats" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-golf-lightgreen transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-sm">View on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer