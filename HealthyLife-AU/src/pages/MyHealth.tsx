import React, { useState, useEffect } from 'react'
import { Activity, Heart, Cigarette, Wine, Weight, Calculator, TrendingUp, TrendingDown, AlertTriangle, ArrowLeft } from 'lucide-react'
import HealthAdvice from '../components/health-related/HealthAdvice'
import NutritionAnalysisCard from '../components/health-related/NutritionAnalysisCard'
import { useNavigate } from 'react-router-dom'
import DiseaseAnalysisCard from '../components/health-related/DiseaseAnalysisCard'

const MyHealth: React.FC<{ healthData?: any }> = ({ healthData }) => {
  const navigate = useNavigate()

  // Check if health data exists and has required fields
  const hasValidHealthData =
    healthData &&
    healthData.age &&
    healthData.gender &&
    healthData.bmi &&
    healthData.currentWeight &&
    healthData.smokingStatus !== undefined &&
    healthData.alcoholConsumption !== undefined

  // If no valid health data, show fallback UI
  if (!hasValidHealthData) {
    return (
      <div className="min-h-screen to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Health Data Found</h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            It looks like you haven't completed your health assessment yet. Please go back to the homepage and fill out the health assessment form to view your personalized health
            insights.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back to Homepage
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">Need help? The health assessment takes just a few minutes to complete.</p>
          </div>
        </div>
      </div>
    )
  }

  // Simulator state
  const [habits, setHabits] = useState({
    exercise: 2, // days per week
    smoking: 0, // cigarettes per day
    alcohol: 1, // drinks per week
    weight: 75, // kg
    sleep: 7, // hours per night
    stress: 3 // scale 1-5
  })

  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nutritionApiData, setNutritionApiData] = useState(null)
  const [nutritionError, setNutritionError] = useState(null)
  const [diseaseData, setDiseaseData] = useState(null)
  const [diseaseError, setDiseaseError] = useState(null)
const [healthLoading, setHealthLoading] = useState(false);
const [diseaseLoading, setDiseaseLoading] = useState(false);
const [nutritionLoading, setNutritionLoading] = useState(false);


  const fetchDiseaseAnalysis = async () => {

  if (
    !healthData?.age ||
    !healthData?.gender ||
    healthData.alcoholConsumption === undefined ||
    !healthData?.smokingStatus ||
    !healthData?.smokingFrequency 
  ) {
    console.warn("Missing required healthData fields for disease fetch");
    return;
  }

  setDiseaseLoading(true);
  setDiseaseError(null);

  console.log(healthData,"jhaisnsisu")

  try {
    const response = await fetch(
      "https://i5r58exmh9.execute-api.ap-southeast-2.amazonaws.com/prod/fetchDisease",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "kQtOrJu6Ba9TExHVFhVAt6aI7VOwMC3pabxQMR1y",
        },
        body: JSON.stringify({
          age: healthData.age || 25,
          sex: healthData.gender,
          alcohol_intake: healthData.alcoholConsumption,
          smoking_status: healthData.smokingStatus,
          smoking_frequency: healthData.smokingFrequency,
          physical_activity_category: "Did not meet guideline",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    // const parsedData = JSON.parse(rawData.body); // response.body is stringified

    console.log("=== Disease API Response ===");
      console.log('Response Status:', response.status)
      console.log('Raw Response:', rawData)
      console.log('Formatted Response:', JSON.stringify(rawData, null, 2))

    setDiseaseData(rawData); // save only results
  } catch (err: any) {
    setDiseaseError(err.message);
    console.error("Disease API Error:", err);
  } finally {
    setDiseaseLoading(false);
  }
};


  const fetchHealthAnalysis = async () => {
    // if (!healthData?.age || !healthData?.gender || !healthData?.alcoholConsumption || !healthData?.smokingStatus) {
    //   return // If no necessary data is sent request
    // }

    setHealthLoading(true)
    setError(null)

    try {
      const response = await fetch('https://i5r58exmh9.execute-api.ap-southeast-2.amazonaws.com/prod/alcoholSmokeDataFetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'kQtOrJu6Ba9TExHVFhVAt6aI7VOwMC3pabxQMR1y'
        },
        body: JSON.stringify({
          age: healthData.age,
          gender: healthData.gender,
          alcohol_intake: healthData.alcoholConsumption,
          smoking_status: healthData.smokingStatus,
          smoking_frequency: healthData.smokingFrequency
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setApiData(data)
    } catch (err) {
      setError(err.message)
      console.error('API Error:', err)
    } finally {
      setHealthLoading(false)
    }
  }

  const fetchNutritionAnalysis = async () => {
    if (!healthData?.apiData) {
      console.log('No API data available for nutrition analysis')
      return
    }

    setNutritionLoading(true)
    setNutritionError(null)

    try {
      console.log('=== Sending Nutrition API Request ===')
      console.log('URL: https://i5r58exmh9.execute-api.ap-southeast-2.amazonaws.com/prod/nutrientsIntakeData')
      console.log('Request Data:', JSON.stringify(healthData.apiData, null, 2))

      const response = await fetch('https://i5r58exmh9.execute-api.ap-southeast-2.amazonaws.com/prod/nutrientsIntakeData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'kQtOrJu6Ba9TExHVFhVAt6aI7VOwMC3pabxQMR1y'
        },
        body: JSON.stringify(healthData.apiData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log('=== Nutrition API Response ===')
      console.log('Response Status:', response.status)
      console.log('Raw Response:', data)
      console.log('Formatted Response:', JSON.stringify(data, null, 2))

      setNutritionApiData(data)
    } catch (err) {
      console.error('=== Nutrition API Error ===')
      console.error('Error:', err)
      setNutritionError(err.message)
    } finally {
      setNutritionLoading(false)
    }
  }

  // Auto-fetch when component mounts and has apiData
  useEffect(() => {
    if (healthData?.apiData) {
      fetchNutritionAnalysis()
      fetchHealthAnalysis()
      fetchDiseaseAnalysis()
    }
  }, [healthData])

  const [predictions, setPredictions] = useState({
    cardiovascularRisk: 15,
    diabetesRisk: 12,
    lifeExpectancy: 78,
    healthScore: 72,
    bmi: 24.5
  })

  // useEffect(() => {
  //   if (healthData) {
  //     fetchHealthAnalysis()
  //   }
  // }, [healthData])


  //   useEffect(() => {
  //   if (healthData) {
  //     console.log("ssmmxmxm");
  //     fetchDiseaseAnalysis()
  //   }
  // }, [healthData])


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
    // {
    //   key: 'exercise',
    //   label: 'Exercise (days/week)',
    //   icon: <Activity className="w-4 h-4" />,
    //   min: 0,
    //   max: 7,
    //   unit: 'days',
    //   color: 'bg-blue-500'
    // },
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
      key: 'Physical Activity',
      label: 'Physical Activity per week',
      icon: <Weight className="w-4 h-4" />,
      min: 1,
      max: 10,
      unit: 'scale',
      color: 'bg-orange-500'
    },
    // {
    //   key: 'sleep',
    //   label: 'Sleep (hours/night)',
    //   icon: <Heart className="w-4 h-4" />,
    //   min: 4,
    //   max: 12,
    //   unit: 'hours',
    //   color: 'bg-indigo-500'
    // },
    // {
    //   key: 'stress',
    //   label: 'Stress Level (1-5)',
    //   icon: <AlertTriangle className="w-4 h-4" />,
    //   min: 1,
    //   max: 5,
    //   unit: 'level',
    //   color: 'bg-pink-500'
    // }
  ]

  const getBMIStatus = (bmi: number): string => {
    if (bmi < 18.5) return 'underweight'
    if (bmi >= 18.5 && bmi < 25) return 'healthy'
    if (bmi >= 25 && bmi < 30) return 'overweight'
    return 'obese'
  }

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return 'bg-yellow-100 text-yellow-800'
    if (bmi >= 18.5 && bmi < 25) return 'bg-green-100 text-green-800'
    if (bmi >= 25 && bmi < 30) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const isLoading = healthLoading || diseaseLoading || nutritionLoading;

  const Loader = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      <span className="ml-4 text-white">Loading...</span>
    </div>
  )
}

  return (
     <div className="min-h-screen bg-transparent">
    {isLoading && <Loader />}
    <div className="min-h-screen bg-transparent">
      {/* Header Section  */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-sm border-b border-green-100 relative">
        {/* background picture */}
        <div className="absolute inset-0 bg-center opacity-30" style={{ backgroundImage: 'url("/myhealthbanner.gif")' }}></div>

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                {/* <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-white" />
                </div> */}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Key Indicators Overview</h1>
              </div>
              <p className="text-gray-600 ">Comprehensive analysis report based on Australian health standards</p>
            </div>
            {/* <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={fetchHealthAnalysis}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? 'Loading...' : 'Refresh Analysis'}
              </button>

              <button
                onClick={fetchNutritionAnalysis}
                disabled={nutritionLoading || !healthData?.apiData}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {nutritionLoading ? 'Loading Nutrition...' : 'Fetch Nutrition Data'}
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Indicators Overview - ORIGINAL CONTENT */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">{healthData?.bmi || 23.9}</p>
                <p className="text-gray-600 font-medium mb-3">BMI Index</p>
                <span className={`inline-block text-sm font-semibold px-4 py-2 rounded-full ${getBMIColor(healthData?.bmi || 23.9)}`}>{getBMIStatus(healthData?.bmi || 23.9)}</span>
              </div>
            </div>

            <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Weight className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">{healthData?.currentWeight || 75}</p>
                <p className="text-gray-600 font-medium mb-3">Current Weight (kg)</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - ORIGINAL CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Alcohol Consumption Analysis */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Wine className="w-5 h-5 text-green-600 mr-2" />
              Alcohol Consumption Analysis
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Weekly Intake</span>
                <span className="font-semibold text-gray-800">{healthData?.alcoholConsumption || 0} standard drinks</span>
              </div>

              {apiData?.alcohol && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Population Sample</span>
                    <span className="font-semibold text-gray-600">{apiData.alcohol.total_population}k people</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Similar Intake Level</span>
                    <span className="font-semibold text-blue-600">
                      {apiData.alcohol.percentage_exceeding}%<span className="text-xs text-gray-500">({apiData.alcohol.exceeding_population}k people)</span>
                    </span>
                  </div>

                  <HealthAdvice apiData={apiData} userIntake={healthData?.alcoholConsumption || 0} type="alcohol" />
                </>
              )}
            </div>
          </div>

          {/* Smoking Analysis */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Cigarette className="w-5 h-5 text-green-600 mr-2" />
              Smoking Status Analysis
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Status</span>
                <span className="font-semibold text-gray-800">{healthData?.smokingStatus || 'Not specified'}</span>
              </div>

              {apiData?.smoking && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Population Sample</span>
                    <span className="font-semibold text-gray-600">{apiData.smoking.total_population}k people</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Same Status as You</span>
                    <span className="font-semibold text-blue-600">
                      {apiData.smoking.percentage_matching}%<span className="text-xs text-gray-500">({apiData.smoking.matching_population}k people)</span>
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      healthData.smokingStatus === 'Never Smoked'
                        ? 'bg-green-50 border-green-200'
                        : healthData.smokingStatus === 'Ex-Smoker'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <Heart
                        className={`w-4 h-4 mt-0.5 ${
                          healthData.smokingStatus === 'Never Smoked' ? 'text-green-600' : healthData.smokingStatus === 'Ex-Smoker' ? 'text-blue-600' : 'text-red-600'
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            healthData.smokingStatus === 'Never Smoked' ? 'text-green-800' : healthData.smokingStatus === 'Ex-Smoker' ? 'text-blue-800' : 'text-red-800'
                          }`}
                        >
                          Health Impact
                        </p>
                        <p
                          className={`text-xs ${
                            healthData.smokingStatus === 'Never Smoked' ? 'text-green-700' : healthData.smokingStatus === 'Ex-Smoker' ? 'text-blue-700' : 'text-red-700'
                          }`}
                        >
                          {healthData.smokingStatus === 'Never Smoked'
                            ? 'Excellent choice for long-term health'
                            : healthData.smokingStatus === 'Ex-Smoker'
                            ? 'Great progress! Health benefits continue to improve'
                            : 'Consider seeking support to quit for better health outcomes'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Disease Risk Assessment */}
          {/* <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
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
          </div> */}

          <DiseaseAnalysisCard diseaseData ={diseaseData} loading={loading} error={diseaseError} />

          {/* Personalized Nutrition Advice */}
          <NutritionAnalysisCard nutritionData={nutritionApiData} loading={loading} error={nutritionError} />
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
    </div>
  )
}

export default MyHealth
