import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  className = '' 
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-gray-400">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-100 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs md:text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {Icon && (
          <div className="bg-golf-lightgreen bg-opacity-20 p-2 rounded-lg">
            <Icon className="h-5 w-5 text-golf-lightgreen" />
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-3 flex items-center">
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
          <span className="text-sm text-gray-400 ml-1">vs previous</span>
        </div>
      )}
    </div>
  )
}

export default StatCard