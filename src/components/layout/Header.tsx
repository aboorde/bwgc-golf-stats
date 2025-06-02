import React from 'react'
import { Trophy, BarChart3 } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-golf-green p-1.5 md:p-2 rounded-lg">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-100">BWGC Golf Stats</h1>
              <p className="text-xs md:text-sm text-gray-400">Myrtle Beach Tournament Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-400">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">8 Players • 4 Days • 3 Courses</span>
              <span className="sm:hidden">8P • 4D • 3C</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header