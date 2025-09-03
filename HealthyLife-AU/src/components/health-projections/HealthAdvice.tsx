import React from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface HealthAdviceProps {
  apiData: any
  userIntake: number
  type: 'alcohol' | 'smoking'
}

const getAlcoholHealthAdvice = (apiData: any, userIntake: number) => {
  if (!apiData?.alcohol?.status) return null

  const status = apiData.alcohol.status.toLowerCase()

  if (status.includes('did not exceed') || status.includes('within')) {
    return {
      type: 'success',
      bgColor: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
      title: 'Health Status',
      message: 'Your alcohol intake is within recommended guidelines. Keep up the healthy choices!',
      icon: CheckCircle
    }
  } else if (status.includes('exceeding') || (status.includes('exceed') && !status.includes('did not exceed'))) {
    return {
      type: 'warning',
      bgColor: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
      title: 'Health Advisory',
      message: 'Your intake exceeds recommended guidelines. Consider reducing consumption for better health outcomes.',
      icon: AlertTriangle
    }
  }

  return null
}

const HealthAdvice: React.FC<HealthAdviceProps> = ({ apiData, userIntake, type }) => {
  const advice = type === 'alcohol' ? getAlcoholHealthAdvice(apiData, userIntake) : null

  if (!advice) return null

  const IconComponent = advice.icon

  return (
    <div className={`p-3 rounded-lg border ${advice.bgColor}`}>
      <div className="flex items-start space-x-2">
        <IconComponent className={`w-4 h-4 mt-0.5 ${advice.iconColor}`} />
        <div>
          <p className={`text-sm font-medium ${advice.titleColor}`}>{advice.title}</p>
          <p className={`text-xs ${advice.textColor}`}>{advice.message}</p>
        </div>
      </div>
    </div>
  )
}

export default HealthAdvice
