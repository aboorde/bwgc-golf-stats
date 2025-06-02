import React from 'react'
import { Trophy, BarChart3 } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-golf-green p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">BWGC Golf Stats</h1>
              <p className="text-sm text-gray-400">Myrtle Beach Tournament Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
              <BarChart3 className="h-4 w-4" />
              <span>8 Players • 4 Days • 3 Courses</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header