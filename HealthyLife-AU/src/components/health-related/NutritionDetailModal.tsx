import React from 'react'
import { X, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'

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
  isOpen: boolean
  onClose: () => void
  nutritionData: NutritionData | null
}

const NutritionDetailModal: React.FC<Props> = ({ isOpen, onClose, nutritionData }) => {
  if (!isOpen || !nutritionData) return null

  // Calculate overview statistics
  const totalNutrients = nutritionData.totals.length
  const adequateCount = nutritionData.totals.filter((n) => n.status === 'adequate').length
  const deficientCount = nutritionData.totals.filter((n) => n.status === 'deficient').length
  const excessiveCount = nutritionData.totals.filter((n) => n.status === 'excessive').length

  // Prepare data for pie chart
  const statusData = [
    { name: 'Adequate', value: adequateCount, color: '#22c55e' },
    { name: 'Deficient', value: deficientCount, color: '#ef4444' },
    { name: 'Excessive', value: excessiveCount, color: '#f97316' }
  ].filter((item) => item.value > 0)

  // Prepare data for meal contribution chart
  const mealData = nutritionData.totals.slice(0, 6).map((nutrient) => {
    const data = { nutrient: nutrient.nutrient_name.slice(0, 10) }
    nutrient.meal_contributions.forEach((contribution) => {
      data[contribution.meal] = contribution.percent_of_total
    })
    return data
  })

  // Get all unique meals
  const allMeals = [...new Set(nutritionData.totals.flatMap((n) => n.meal_contributions.map((m) => m.meal)))]
  const mealColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  // Prepare radial chart data for top nutrients
  const radialData = nutritionData.totals.slice(0, 6).map((nutrient) => ({
    name: nutrient.nutrient_name.slice(0, 12),
    value: Math.min(100, nutrient.percent_of_recommendation * 100),
    fill: nutrient.status === 'deficient' ? '#ef4444' : nutrient.status === 'adequate' ? '#22c55e' : '#f97316'
  }))

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

  const getRecommendations = () => {
    const deficient = nutritionData.totals.filter((n) => n.status === 'deficient').slice(0, 3)
    return deficient.map((nutrient) => {
      const recommendations = {
        'Energy(a)': 'Consider increasing portion sizes or adding healthy snacks between meals',
        Protein: 'Include more lean meats, fish, eggs, legumes, or dairy in your meals',
        'Total Fat(c)': 'Add healthy fats like avocado, nuts, olive oil, or fatty fish',
        'Carbohydrate(c)': 'Include more whole grains, fruits, and vegetables',
        'Dietary Fibre': 'Increase intake of fruits, vegetables, whole grains, and legumes',
        Calcium: 'Include more dairy products, leafy greens, or fortified foods'
      }
      return {
        nutrient: nutrient.nutrient_name,
        recommendation: recommendations[nutrient.nutrient_name] || 'Consult a nutritionist for personalized advice'
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Comprehensive Nutrition Report</h2>
              <p className="text-green-100 mt-1">Detailed analysis of your daily nutritional intake</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overview Statistics */}
          <div className="p-6 bg-gray-50 relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                <circle cx="50" cy="50" r="20" fill="#10b981" />
                <circle cx="350" cy="30" r="15" fill="#3b82f6" />
                <circle cx="300" cy="150" r="25" fill="#f59e0b" />
                <circle cx="80" cy="180" r="12" fill="#ef4444" />
                <path d="M100 100Q150 50 200 100T300 100" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.3" />
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalNutrients}</p>
                    <p className="text-sm text-gray-600">Total Nutrients</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{adequateCount}</p>
                    <p className="text-sm text-gray-600">Adequate</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{deficientCount}</p>
                    <p className="text-sm text-gray-600">Deficient</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{Math.round((adequateCount / totalNutrients) * 100)}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="p-6 relative">
            {/* Background food illustrations */}
            <div className="absolute top-4 right-4 opacity-10">
              <div className="text-6xl">🥗</div>
            </div>
            <div className="absolute bottom-4 left-4 opacity-10">
              <div className="text-5xl">🍎</div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4 relative z-10">Visual Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
              {/* Status Distribution Pie Chart */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Nutrition Status Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Nutrient Achievement Radial Chart */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Nutrient Achievement (%)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={radialData}>
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {/* Meal Contribution Bar Chart */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Meal Contributions</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mealData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nutrient" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    {allMeals.map((meal, index) => (
                      <Bar key={meal} dataKey={meal} fill={mealColors[index % mealColors.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Nutrient List */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Nutrient Analysis</h3>
            <div className="space-y-6">
              {nutritionData.totals.map((nutrient) => {
                // console.log(`${nutrient.nutrient_name} - Raw percent_of_recommendation:`, nutrient.percent_of_recommendation)
                const colors = getStatusColor(nutrient.status)
                return (
                  <div key={nutrient.nutrient_id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header Section */}
                    <div className={`${colors.bg} ${colors.border} border-b px-6 py-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                            {/* Nutrient category icons */}
                            {nutrient.nutrient_name.includes('Energy') ? (
                              <div className="text-2xl">⚡</div>
                            ) : nutrient.nutrient_name.includes('Protein') ? (
                              <div className="text-2xl">🥩</div>
                            ) : nutrient.nutrient_name.includes('Fat') ? (
                              <div className="text-2xl">🥑</div>
                            ) : nutrient.nutrient_name.includes('Carbohydrate') ? (
                              <div className="text-2xl">🍞</div>
                            ) : nutrient.nutrient_name.includes('Fibre') ? (
                              <div className="text-2xl">🌾</div>
                            ) : nutrient.nutrient_name.includes('Calcium') ? (
                              <div className="text-2xl">🥛</div>
                            ) : nutrient.nutrient_name.includes('Iron') ? (
                              <div className="text-2xl">🔴</div>
                            ) : nutrient.nutrient_name.includes('Vitamin') ? (
                              <div className="text-2xl">💊</div>
                            ) : (
                              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">{nutrient.nutrient_name}</h4>
                            <p className="text-sm text-gray-600">{nutrient.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${colors.badge}`}>{nutrient.status.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{nutrient.intake_amount.toFixed(1)}</p>
                          <p className="text-sm text-gray-600">Current Intake</p>
                          <p className="text-xs text-gray-500">{nutrient.unit}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{nutrient.recommended_amount.toFixed(0)}</p>
                          <p className="text-sm text-gray-600">Recommended</p>
                          <p className="text-xs text-gray-500">{nutrient.unit}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{(nutrient.percent_of_recommendation || 0).toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">Achievement</p>
                          <p className="text-xs text-gray-500">of daily goal</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="px-6 py-4">
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Daily Goal Progress</span>
                          <span className="text-sm text-gray-500">{(nutrient.percent_of_recommendation || 0).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 shadow-sm ${
                              nutrient.status === 'deficient'
                                ? 'bg-gradient-to-r from-red-400 to-red-500'
                                : nutrient.status === 'adequate'
                                ? 'bg-gradient-to-r from-green-400 to-green-500'
                                : 'bg-gradient-to-r from-orange-400 to-orange-500'
                            }`}
                            style={{ width: `${Math.min(100, nutrient.percent_of_recommendation || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Meal Breakdown Section */}
                    {nutrient.meal_contributions && nutrient.meal_contributions.length > 0 && (
                      <div className="px-6 pb-6">
                        <div className="mb-4">
                          <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Meal Distribution
                          </h5>
                        </div>

                        <div className="space-y-3">
                          {nutrient.meal_contributions.map((contribution, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-4 h-4 rounded-full ${
                                      index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-yellow-500' : index === 3 ? 'bg-purple-500' : 'bg-pink-500'
                                    }`}
                                  ></div>
                                  <div className="text-lg">
                                    {contribution.meal.toLowerCase().includes('breakfast')
                                      ? '🌅'
                                      : contribution.meal.toLowerCase().includes('brunch')
                                      ? '🥐'
                                      : contribution.meal.toLowerCase().includes('lunch')
                                      ? '🍽️'
                                      : contribution.meal.toLowerCase().includes('dinner')
                                      ? '🌙'
                                      : contribution.meal.toLowerCase().includes('snack')
                                      ? '🍪'
                                      : '🍴'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800 capitalize">{contribution.meal}</p>
                                    <p className="text-xs text-gray-500">{contribution.percent_of_total.toFixed(1)}% of total intake</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">
                                    {contribution.intake_amount.toFixed(2)} {nutrient.unit}
                                  </p>
                                  <p className="text-sm text-gray-600">{(contribution.percent_of_recommendation || 0).toFixed(1)}% daily goal</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-yellow-500' : index === 3 ? 'bg-purple-500' : 'bg-pink-500'
                                  }`}
                                  style={{ width: `${contribution.percent_of_total}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Recommendations</h3>
            <div className="space-y-3">
              {getRecommendations().map((rec, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">{rec.nutrient}</p>
                      <p className="text-green-800 text-sm mt-1">{rec.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <button onClick={onClose} className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors">
              Close Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NutritionDetailModal
