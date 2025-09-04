import React, { useState } from 'react'
import NutritionDetailModal from './NutritionDetailModal'

interface NutritionData {
  totals: Array<{
    nutrient_id: number
    nutrient_name: string
    category: string
    unit: string
    intake_amount: number
    recommended_amount: number
    percent_of_recommendation: number
    status: string
    meal_contributions: Array<{
      meal: string
      intake_amount: number
      percent_of_recommendation: number
      percent_of_total: number
    }>
  }>
}

interface Props {
  nutritionData: NutritionData | null
  loading?: boolean
  error?: string | null
}

const NutritionAnalysisCard: React.FC<Props> = ({ nutritionData, loading, error }) => {
  const [showDetailModal, setShowDetailModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deficient':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-700' }
      case 'adequate':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100 text-green-700' }
      case 'excessive':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' }
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            Personalized Nutrition Analysis
          </h3>
        </div>

        <div className="space-y-4">
          {nutritionData?.totals ? (
            nutritionData.totals.slice(0, 2).map((nutrient) => {
              const colors = getStatusColor(nutrient.status)

              return (
                <div key={nutrient.nutrient_id} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                  {/* Header with nutrient name and status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-800">{nutrient.nutrient_name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>{nutrient.status.toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {nutrient.intake_amount.toFixed(1)}/{nutrient.recommended_amount.toFixed(0)}
                        <span className="text-sm text-gray-500 ml-1">{nutrient.unit}</span>
                      </p>
                      <p className="text-xs text-gray-600">{(nutrient.percent_of_recommendation).toFixed(1)}% of daily needs</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="w-full bg-white rounded-full h-3 shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          nutrient.status === 'deficient' ? 'bg-red-400' : nutrient.status === 'adequate' ? 'bg-green-400' : 'bg-orange-400'
                        }`}
                        style={{ width: `${Math.min(100, nutrient.percent_of_recommendation)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Meal contributions breakdown */}
                  {nutrient.meal_contributions && nutrient.meal_contributions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Meal Breakdown:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {nutrient.meal_contributions.map((contribution, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <span className="capitalize font-medium text-gray-800">{contribution.meal}</span>
                                <span className="text-sm text-gray-500">({contribution.percent_of_total.toFixed(1)}% of total)</span>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {contribution.intake_amount.toFixed(2)} {nutrient.unit}
                                </p>
                                <p className="text-xs text-gray-600">{(contribution.percent_of_recommendation).toFixed(1)}% daily needs</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-100 rounded-full h-1">
                                <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${contribution.percent_of_total}%` }}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : loading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading nutrition analysis...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Complete the health assessment to see your nutrition analysis</p>
            </div>
          )}

          {nutritionData?.totals && nutritionData.totals.length > 2 && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Showing 2 of {nutritionData.totals.length} nutrients</p>
              <button
                onClick={() => setShowDetailModal(true)}
                className="w-full bg-gradient-to-r from-green-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                View Complete Nutrition Report →
              </button>
            </div>
          )}
        </div>
      </div>

      <NutritionDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} nutritionData={nutritionData} />
    </>
  )
}

export default NutritionAnalysisCard
