import React from 'react'

const MyHealth: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent from-green-50 via-emerald-50 to-teal-50">
      {/* Header Section */}
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
        {/* Key Indicators Overview */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      </div>
    </div>
  )
}

export default MyHealth
