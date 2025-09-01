import React, { useState, useEffect } from 'react'
import { Activity, Heart, Cigarette, Wine, Weight, Calculator, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const MyHealth: React.FC = () => {
  // Simulator state
  const [habits, setHabits] = useState({
    exercise: 2, // days per week
    smoking: 0, // cigarettes per day
    alcohol: 1, // drinks per week
    weight: 75, // kg
    sleep: 7, // hours per night
    stress: 3 // scale 1-5
  })

  const [predictions, setPredictions] = useState({
    cardiovascularRisk: 15,
    diabetesRisk: 12,
    lifeExpectancy: 78,
    healthScore: 72,
    bmi: 24.5
  })

  const [comparison, setComparison] = useState(null)

  // Calculate health predictions based on habits
  const calculatePredictions = (currentHabits) => {
    const baseRisk = {
      cardiovascular: 20,
      diabetes: 15,
      lifeExpectancy: 75,
      healthScore: 60
    }

    const exerciseFactor = Math.max(0, (currentHabits.exercise - 2) * 2)
    const smokingPenalty = currentHabits.smoking * 0.5
    const alcoholFactor = currentHabits.alcohol > 7 ? (currentHabits.alcohol - 7) * 0.3 : -(Math.min(currentHabits.alcohol, 2) * 0.2)
    const sleepFactor = Math.abs(currentHabits.sleep - 8) * 0.5
    const stressFactor = (currentHabits.stress - 1) * 0.8

    const cardiovascularRisk = Math.max(5, Math.min(50, baseRisk.cardiovascular - exerciseFactor + smokingPenalty + alcoholFactor + sleepFactor + stressFactor))

    const diabetesRisk = Math.max(3, Math.min(40, baseRisk.diabetes - exerciseFactor * 0.8 + smokingPenalty * 0.6 + alcoholFactor * 0.7 + stressFactor))

    const lifeExpectancy = Math.max(
      65,
      Math.min(95, baseRisk.lifeExpectancy + exerciseFactor * 0.5 - smokingPenalty * 0.3 - alcoholFactor * 0.4 - sleepFactor * 0.2 - stressFactor * 0.3)
    )

    const healthScore = Math.max(20, Math.min(100, baseRisk.healthScore + exerciseFactor * 2 - smokingPenalty * 1.5 - alcoholFactor - sleepFactor - stressFactor * 1.2))

    const bmi = currentHabits.weight / Math.pow(1.75, 2)

    return {
      cardiovascularRisk: Math.round(cardiovascularRisk),
      diabetesRisk: Math.round(diabetesRisk),
      lifeExpectancy: Math.round(lifeExpectancy * 10) / 10,
      healthScore: Math.round(healthScore),
      bmi: Math.round(bmi * 10) / 10
    }
  }

  useEffect(() => {
    const newPredictions = calculatePredictions(habits)
    setPredictions(newPredictions)
  }, [habits])

  const updateHabit = (habit, value) => {
    setHabits((prev) => ({ ...prev, [habit]: value }))
  }

  const compareWithCurrent = () => {
    setComparison({
      current: { ...predictions },
      habits: { ...habits }
    })
  }

  const getRiskColor = (risk) => {
    if (risk < 10) return 'text-green-600'
    if (risk < 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const habitControls = [
    {
      key: 'exercise',
      label: 'Exercise (days/week)',
      icon: <Activity className="w-4 h-4" />,
      min: 0,
      max: 7,
      unit: 'days',
      color: 'bg-blue-500'
    },
    {
      key: 'smoking',
      label: 'Smoking (cigarettes/day)',
      icon: <Cigarette className="w-4 h-4" />,
      min: 0,
      max: 40,
      unit: 'cigs',
      color: 'bg-red-500'
    },
    {
      key: 'alcohol',
      label: 'Alcohol (drinks/week)',
      icon: <Wine className="w-4 h-4" />,
      min: 0,
      max: 21,
      unit: 'drinks',
      color: 'bg-purple-500'
    },
    {
      key: 'weight',
      label: 'Weight (kg)',
      icon: <Weight className="w-4 h-4" />,
      min: 50,
      max: 120,
      unit: 'kg',
      color: 'bg-orange-500'
    },
    {
      key: 'sleep',
      label: 'Sleep (hours/night)',
      icon: <Heart className="w-4 h-4" />,
      min: 4,
      max: 12,
      unit: 'hours',
      color: 'bg-indigo-500'
    },
    {
      key: 'stress',
      label: 'Stress Level (1-5)',
      icon: <AlertTriangle className="w-4 h-4" />,
      min: 1,
      max: 5,
      unit: 'level',
      color: 'bg-pink-500'
    }
  ]

  return (
    <div className="min-h-screen bg-transparent from-green-50 via-emerald-50 to-teal-50">
      {/* Header Section - ORIGINAL CONTENT */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">My Health Records</h1>
              <p className="text-gray-600 mt-2">Comprehensive analysis report based on Australian health standards</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-green-100 px-4 py-2 rounded-full">
                <span className="text-green-800 font-medium">Status: Healthy</span>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">Reassessment</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Indicators Overview - ORIGINAL CONTENT */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Key Indicators Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">23.9</p>
                <p className="text-sm text-gray-600 mb-2">BMI Index</p>
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">healthy</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">75 kg</p>
                <p className="text-sm text-gray-600">Current weight</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">70 kg</p>
                <p className="text-sm text-gray-600">Target weight</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600 mb-2">2491</p>
                <p className="text-sm text-gray-600">Total daily consumption (calories)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - ORIGINAL CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Personal Profile */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Profile
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Age</p>
                <p className="text-lg font-semibold text-gray-800">23 years old</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="text-lg font-semibold text-gray-800">Male</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Height</p>
                <p className="text-lg font-semibold text-gray-800">177 cm</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Activity level</p>
                <p className="text-lg font-semibold text-gray-800">Light activity</p>
              </div>
            </div>
          </div>

          {/* Metabolic Analysis */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Metabolic Analysis
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Basal metabolic rate (BMR)</span>
                <span className="font-semibold text-gray-800">1812 calories/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total energy expenditure (TDEE)</span>
                <span className="font-semibold text-gray-800">2491 calories/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Target caloric intake</span>
                <span className="font-semibold text-green-600">1706 calories/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily caloric deficit</span>
                <span className="font-semibold text-red-500">-786 calories</span>
              </div>
            </div>
          </div>

          {/* Disease Risk Assessment */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Disease Risk Assessment
            </h3>

            <p className="text-sm text-gray-600 mb-4">Ten-year disease risk prediction based on Australian health data</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">Type 2 diabetes</span>
                </div>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">Low risk</span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>50% lower than the Australian average</p>
                <p>25% people(4/16) in your area suffer from this disease</p>
                <p className="text-green-600">Prevention Time</p>
              </div>
            </div>
          </div>

          {/* Personalized Nutrition Advice */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Personalized Nutrition Advice
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="font-medium text-gray-800">Vitamin C</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">0.0/45 mg</p>
                  <p className="text-xs text-red-500">0% met</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">Best sources: Citrus fruits • Strawberries • Bell peppers • Broccoli • Tomatoes</p>
                <p className="text-green-600">Try for adults</p>
              </div>
            </div>
          </div>
        </div>

        {/* NEW CONTENT: Lifestyle Health Simulator */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Calculator className="w-6 h-6 text-green-600 mr-2" />
            Lifestyle Health Simulator
          </h2>
          <p className="text-gray-600 mb-6">Adjust your lifestyle habits and see the predicted impact on your long-term health outcomes</p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Habit Controls */}
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Adjust Your Lifestyle</h3>

              <div className="space-y-6">
                {habitControls.map((control) => (
                  <div key={control.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${control.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          <div className={`${control.color.replace('bg-', 'text-')}`}>{control.icon}</div>
                        </div>
                        <label className="font-medium text-gray-700 text-sm">{control.label}</label>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {habits[control.key]} {control.unit}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        value={habits[control.key]}
                        onChange={(e) => updateHabit(control.key, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, ${control.color} 0%, ${control.color} ${
                            ((habits[control.key] - control.min) / (control.max - control.min)) * 100
                          }%, #e5e7eb ${((habits[control.key] - control.min) / (control.max - control.min)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={compareWithCurrent} className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                Save Current Scenario
              </button>
            </div>

            {/* Health Predictions */}
            <div className="space-y-6">
              {/* Current Predictions */}
              <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Predicted Health Outcomes</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className={`text-2xl font-bold ${getRiskColor(predictions.cardiovascularRisk)}`}>{predictions.cardiovascularRisk}%</div>
                    <div className="text-sm text-gray-600 mt-1">Cardiovascular Risk</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className={`text-2xl font-bold ${getRiskColor(predictions.diabetesRisk)}`}>{predictions.diabetesRisk}%</div>
                    <div className="text-sm text-gray-600 mt-1">Diabetes Risk</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{predictions.lifeExpectancy}</div>
                    <div className="text-sm text-gray-600 mt-1">Life Expectancy</div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className={`text-2xl font-bold ${getHealthScoreColor(predictions.healthScore)}`}>{predictions.healthScore}</div>
                    <div className="text-sm text-gray-600 mt-1">Health Score</div>
                  </div>
                </div>
              </div>

              {/* Scenario Comparison */}
              {comparison && (
                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Scenario Comparison</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Cardiovascular Risk</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{comparison.current.cardiovascularRisk}%</span>
                        <span className="text-gray-400">→</span>
                        <span className={getRiskColor(predictions.cardiovascularRisk)}>{predictions.cardiovascularRisk}%</span>
                        {predictions.cardiovascularRisk < comparison.current.cardiovascularRisk ? (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        ) : predictions.cardiovascularRisk > comparison.current.cardiovascularRisk ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Life Expectancy</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{comparison.current.lifeExpectancy}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-blue-600">{predictions.lifeExpectancy}</span>
                        {predictions.lifeExpectancy > comparison.current.lifeExpectancy ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : predictions.lifeExpectancy < comparison.current.lifeExpectancy ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Health Score</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{comparison.current.healthScore}</span>
                        <span className="text-gray-400">→</span>
                        <span className={getHealthScoreColor(predictions.healthScore)}>{predictions.healthScore}</span>
                        {predictions.healthScore > comparison.current.healthScore ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : predictions.healthScore < comparison.current.healthScore ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Personalized Recommendations</h3>

                <div className="space-y-3">
                  {habits.exercise < 3 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-800">Try to increase exercise to 3-5 days per week</span>
                    </div>
                  )}

                  {habits.smoking > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <Cigarette className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">Consider quitting smoking for significant health benefits</span>
                    </div>
                  )}

                  {habits.sleep < 7 && (
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                      <Heart className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm text-indigo-800">Aim for 7-9 hours of sleep per night</span>
                    </div>
                  )}

                  {predictions.bmi > 25 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Weight className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-orange-800">Consider weight management for better health outcomes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyHealth
