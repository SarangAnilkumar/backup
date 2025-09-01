import React, { useState } from 'react'
import { Map, TrendingUp, TrendingDown, Users, MapPin, Calendar, Filter, Download, Info, AlertTriangle, Target, Activity } from 'lucide-react'

const RegionalHealthAnalytics = () => {
  const [selectedYear, setSelectedYear] = useState('2024')
  const [selectedCondition, setSelectedCondition] = useState('obesity')
  const [selectedRegion, setSelectedRegion] = useState('victoria')

  const healthConditions = [
    {
      id: 'obesity',
      name: 'Obesity',
      color: 'bg-orange-500',
      national: 31.3,
      state: 29.8,
      trend: -2.1,
      description: 'Adult obesity rates (BMI ≥30)',
      severity: 'high'
    },
    {
      id: 'diabetes',
      name: 'Diabetes',
      color: 'bg-red-500',
      national: 31.3,
      state: 29.8,
      trend: 1.5,
      description: 'Type 2 diabetes prevalence',
      severity: 'high'
    },
    {
      id: 'hypertension',
      name: 'Hypertension',
      color: 'bg-purple-500',
      national: 31.3,
      state: 29.8,
      trend: -0.8,
      description: 'High blood pressure cases',
      severity: 'medium'
    },
    {
      id: 'mental_health',
      name: 'Mental Health',
      color: 'bg-blue-500',
      national: 26.8,
      state: 24.2,
      trend: 3.2,
      description: 'Reported mental health issues',
      severity: 'high'
    },
    {
      id: 'cardiovascular',
      name: 'Cardiovascular',
      color: 'bg-pink-500',
      national: 18.5,
      state: 17.1,
      trend: -1.2,
      description: 'Heart disease prevalence',
      severity: 'medium'
    },
    {
      id: 'respiratory',
      name: 'Respiratory',
      color: 'bg-teal-500',
      national: 15.3,
      state: 16.8,
      trend: 0.4,
      description: 'Asthma and COPD cases',
      severity: 'low'
    }
  ]

  const regionData = [
    { name: 'Melbourne CBD', population: 180000, rate: 25.4, trend: -1.8, riskLevel: 'low' },
    { name: 'Western Suburbs', population: 850000, rate: 34.2, trend: 2.1, riskLevel: 'high' },
    { name: 'Eastern Suburbs', population: 650000, rate: 22.8, trend: -0.9, riskLevel: 'low' },
    { name: 'Northern Suburbs', population: 720000, rate: 31.5, trend: 1.2, riskLevel: 'medium' },
    { name: 'Southern Suburbs', population: 590000, rate: 28.9, trend: -0.5, riskLevel: 'medium' },
    { name: 'Bayside', population: 320000, rate: 19.6, trend: -2.3, riskLevel: 'low' }
  ]

  const healthcareResources = [
    { type: 'Hospitals', count: 47, per100k: 1.6, change: 2 },
    { type: 'GP Clinics', count: 1240, per100k: 42.1, change: 15 },
    { type: 'Specialists', count: 890, per100k: 30.2, change: -3 },
    { type: 'Mental Health', count: 320, per100k: 10.8, change: 8 }
  ]

  const selectedConditionData = healthConditions.find((c) => c.id === selectedCondition)

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend) => {
    return trend > 0 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-green-500" />
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                <Map className="inline w-10 h-10 text-green-600 mr-3" />
                City Health Overview
              </h1>
              <p className="text-lg text-gray-600">Comprehensive health analytics across Australian regions and communities</p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Health Condition</label>
              <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {healthConditions.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="victoria">Victoria</option>
                <option value="nsw">New South Wales</option>
                <option value="qld">Queensland</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Heat Map</option>
                <option>Regional Data</option>
                <option>Time Series</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health Map Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Health Map - {selectedConditionData?.name}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{selectedYear}</span>
                </div>
                <div className="text-sm text-gray-600">{selectedConditionData?.description}</div>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="p-6">
            <div className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border-2 border-blue-200 flex items-center justify-center mb-6">
              {/* Simulated Map */}
              <div className="grid grid-cols-4 gap-4 w-full h-full p-8">
                <div className="bg-orange-300 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-white font-semibold">West</span>
                </div>
                <div className="bg-yellow-200 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-gray-800 font-semibold">North</span>
                </div>
                <div className="bg-green-200 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-gray-800 font-semibold">CBD</span>
                </div>
                <div className="bg-blue-300 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-white font-semibold">East</span>
                </div>
                <div className="bg-orange-400 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-white font-semibold">SW</span>
                </div>
                <div className="bg-yellow-300 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-gray-800 font-semibold">South</span>
                </div>
                <div className="bg-green-300 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-gray-800 font-semibold">SE</span>
                </div>
                <div className="bg-teal-200 rounded-lg flex items-center justify-center opacity-80">
                  <span className="text-gray-800 font-semibold">Bay</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                <div className="text-xs font-medium text-gray-700 mb-2">Prevalence Rate</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-300 rounded"></div>
                  <span className="text-xs">Low (15-20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-300 rounded"></div>
                  <span className="text-xs">Medium (20-30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  <span className="text-xs">High (30%+)</span>
                </div>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-xl border ${selectedConditionData?.color.replace('bg-', 'border-').replace('-500', '-200')} bg-opacity-10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">National Average</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedConditionData?.national}%</p>
                  </div>
                  <Target className={`w-8 h-8 ${selectedConditionData?.color.replace('bg-', 'text-')}`} />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${selectedConditionData?.color.replace('bg-', 'border-').replace('-500', '-200')} bg-opacity-10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">State Average</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedConditionData?.state}%</p>
                  </div>
                  <MapPin className={`w-8 h-8 ${selectedConditionData?.color.replace('bg-', 'text-')}`} />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${selectedConditionData && selectedConditionData.trend > 0 ? 'border-red-200' : 'border-green-200'} bg-opacity-10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Annual Trend</p>
                    <p className={`text-2xl font-bold ${selectedConditionData && selectedConditionData.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedConditionData && selectedConditionData.trend > 0 ? '+' : ''}
                      {selectedConditionData?.trend}%
                    </p>
                  </div>
                  {selectedConditionData && getTrendIcon(selectedConditionData.trend)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Regional Breakdown */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Regional Analysis</h3>

            <div className="space-y-4">
              {regionData.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{region.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(region.riskLevel)}`}>{region.riskLevel} risk</span>
                    </div>
                    <p className="text-sm text-gray-600">{region.population.toLocaleString()} residents</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{region.rate}%</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(region.trend)}
                      <span className={`text-sm ${region.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {region.trend > 0 ? '+' : ''}
                        {region.trend}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Healthcare Resources */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Healthcare Resources</h3>

            <div className="space-y-4">
              {healthcareResources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{resource.type}</h4>
                    <p className="text-sm text-gray-600">{resource.per100k} per 100k residents</p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{resource.count}</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(resource.change)}
                      <span className={`text-sm ${resource.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {resource.change > 0 ? '+' : ''}
                        {resource.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Conditions Overview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">All Health Conditions Overview</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthConditions.map((condition) => (
              <div
                key={condition.id}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedCondition === condition.id ? `${condition.color.replace('bg-', 'border-')} bg-opacity-10` : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCondition(condition.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">{condition.name}</h4>
                  <div className={`w-4 h-4 rounded-full ${condition.color}`}></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">National:</span>
                    <span className="font-semibold">{condition.national}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">State:</span>
                    <span className="font-semibold">{condition.state}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trend:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(condition.trend)}
                      <span className={`text-sm font-semibold ${condition.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {condition.trend > 0 ? '+' : ''}
                        {condition.trend}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(condition.severity)}`}>{condition.severity} priority</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights and Alerts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Key Insights
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900">Demographic Pattern</h4>
                <p className="text-sm text-blue-800 mt-1">Western suburbs show 34.2% higher rates, correlating with lower socioeconomic indicators.</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900">Positive Trend</h4>
                <p className="text-sm text-green-800 mt-1">Bayside region demonstrates 2.3% improvement, attributed to new wellness programs.</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900">Resource Opportunity</h4>
                <p className="text-sm text-purple-800 mt-1">15 new GP clinics added this year, improving healthcare accessibility.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Priority Areas
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-red-900">Western Suburbs</h4>
                  <span className="text-red-600 font-bold">HIGH</span>
                </div>
                <p className="text-sm text-red-800 mt-1">Multiple health indicators above state average. Requires intervention programs.</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-yellow-900">Northern Region</h4>
                  <span className="text-yellow-600 font-bold">MEDIUM</span>
                </div>
                <p className="text-sm text-yellow-800 mt-1">Increasing trend in mental health cases. Enhanced support services needed.</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-orange-900">Healthcare Access</h4>
                  <span className="text-orange-600 font-bold">MEDIUM</span>
                </div>
                <p className="text-sm text-orange-800 mt-1">Specialist availability remains below optimal levels in outer regions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegionalHealthAnalytics
