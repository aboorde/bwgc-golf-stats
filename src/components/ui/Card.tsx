import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3 md:mb-4">
          {title && <h3 className="text-base md:text-lg font-semibold text-gray-100">{title}</h3>}
          {subtitle && <p className="text-xs md:text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card