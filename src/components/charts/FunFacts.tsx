import React, { useState } from 'react'
import { useFunFacts, useTournamentSummary } from '../../hooks'
import { 
  Sparkles,
  RefreshCw
} from 'lucide-react'

interface FunFactsProps {
  refreshInterval?: number
  showCategories?: boolean
}

const FunFacts: React.FC<FunFactsProps> = ({ 
  refreshInterval = 5000,
  showCategories = true 
}) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const funFacts = useFunFacts()
  const { quickStats } = useTournamentSummary()

  // Auto-advance facts
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [funFacts.length, refreshInterval])

  const currentFact = funFacts[currentFactIndex]
  const categories = Array.from(new Set(funFacts.map(f => f.category)))

  return (
    <div className="space-y-6">
      {/* Main Fun Fact Display */}
      <div className={`p-6 rounded-xl border-2 ${currentFact.border} ${currentFact.bg} transition-all duration-500`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full bg-gray-800 shadow-sm`}>
            <span className="text-2xl">{currentFact.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${currentFact.color}`}>
                {currentFact.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">
                  {currentFactIndex + 1} / {funFacts.length}
                </span>
                <button
                  onClick={() => setCurrentFactIndex((prev) => (prev + 1) % funFacts.length)}
                  className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                >
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {currentFact.fact}
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentFact.bg} ${currentFact.color}`}>
                <Sparkles className="h-3 w-3 mr-1" />
                {currentFact.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2">
        {funFacts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFactIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentFactIndex ? 'bg-golf-lightgreen' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Category Quick Access */}
      {showCategories && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h4 className="font-semibold text-gray-100 mb-4">Fun Fact Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(category => {
              const categoryFacts = funFacts.filter(f => f.category === category)
              const firstFact = categoryFacts[0]
              return (
                <button
                  key={category}
                  onClick={() => {
                    const factIndex = funFacts.findIndex(f => f.category === category)
                    setCurrentFactIndex(factIndex)
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors hover:shadow-sm ${
                    currentFact.category === category 
                      ? `${firstFact.bg} ${firstFact.border}` 
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{firstFact.icon}</span>
                    <span className="text-sm font-medium text-gray-100">{category}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {categoryFacts.length} fact{categoryFacts.length !== 1 ? 's' : ''}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-750 p-6 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-gray-100 mb-4">Tournament by the Numbers</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {quickStats.map((stat) => (
            <div key={stat.stat}>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FunFacts