import React, { useMemo, useState, useEffect } from 'react'
import { Heart, Activity, Users, Target, TrendingUp, Award, CheckCircle, ArrowRight, Play, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Dashboard: React.FC<{ onHealthDataSubmit?: (data: any) => void }> = ({ onHealthDataSubmit }) => {
  // --- Modal & form state ---
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [age, setAge] = useState(23)
  const [gender, setGender] = useState('Male')
  const [bmi, setBmi] = useState(23.9)
  const [currentWeight, setCurrentWeight] = useState(75)
  const [smokingStatus, setSmokingStatus] = useState('Never Smoked')
  const [smokingFrequency, setSmokingFrequency] = useState('1-2 days')
  const [alcoholConsumption, setAlcoholConsumption] = useState(0)
  const [mealPreferences, setMealPreferences] = useState([])
  const [allFoods, setAllFoods] = useState([])
  const [foodSuggestions, setFoodSuggestions] = useState({})
  const [mealFoodList, setMealFoodList] = useState({
    Breakfast: [{ name: '', quantity: '', id: '' }],
    Brunch: [{ name: '', quantity: '', id: '' }],
    Lunch: [{ name: '', quantity: '', id: '' }],
    Dinner: [{ name: '', quantity: '', id: '' }],
    'Evening Snacks': [{ name: '', quantity: '', id: '' }]
  })

  const navigate = useNavigate()

  // Animation state
  const [isVisible, setIsVisible] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const canNext = useMemo(() => {
    if (step === 0) return age > 0 && age < 120
    if (step === 1) return Boolean(gender)
    if (step === 2) return bmi >= 15 && bmi <= 50 // reasonable BMI range
    if (step === 3) return currentWeight >= 30 && currentWeight <= 200 // reasonable weight range
    if (step === 4) return Boolean(smokingStatus && alcoholConsumption >= 0)
    if (step === 5) return Boolean(mealPreferences.length > 0)
    return true
  }, [step, age, gender, bmi, currentWeight, smokingStatus, alcoholConsumption, mealPreferences])

  const reset = () => {
    setStep(0)
    setAge(23)
    setGender('Male')
    setBmi(23.9)
    setCurrentWeight(75)
    setSmokingStatus('Never Smoked')
    setSmokingFrequency('1-2 days')
    setAlcoholConsumption(0)
    setMealPreferences([])
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    }
  }

  const handleAddFood = (meal: string) => {
    setMealFoodList((prev) => ({
      ...prev,
      [meal]: [...prev[meal], { name: '', quantity: '', id: '' }]
    }))
  }

  const handleRemoveFood = (meal: string, index: number) => {
    setMealFoodList((prev) => {
      const updatedFoods = [...prev[meal]]
      updatedFoods.splice(index, 1) // Delete the food at the specified index
      return { ...prev, [meal]: updatedFoods } // update status
    })
  }

  const handleFoodChange = (meal: string, index: number, value: string) => {
    console.log(meal, index, value, 'kmsmsd,d,d')
    const updatedFoods = [...mealFoodList[meal]]
    updatedFoods[index] = value
    setMealFoodList((prev) => ({
      ...prev,
      [meal]: updatedFoods
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted at step:', step)

    let formattedSmokingFrequency = smokingFrequency
    // Remove the "per week" part if you selected
    if (smokingFrequency.includes('per week')) {
      formattedSmokingFrequency = smokingFrequency.replace(' per week', '')
    }

    console.log('Formatted Smoking Frequency:', formattedSmokingFrequency)

    if (step === 5) {
      // Build API format data structure
      const apiFormatData = {
        sex: gender.toLowerCase(), // Convert to lowercase for API
        age: age,
        meals: {}
      }

      // Process selected meals into API format
      mealPreferences.forEach((meal) => {
        if (mealFoodList[meal] && mealFoodList[meal].length > 0) {
          const mealKey = meal.toLowerCase().replace(' ', '_') // Convert "Evening Snacks" to "evening_snacks"
          apiFormatData.meals[mealKey] = []

          mealFoodList[meal].forEach((food) => {
            // Only add foods that have valid data
            if (food && typeof food === 'object' && food.name && food.quantity && food.id) {
              apiFormatData.meals[mealKey].push({
                public_food_key: food.id,
                quantity: parseInt(food.quantity) || 1,
                unit: 'g' // Hardcoded as requested
              })
            }
          })
        }
      })

      // console.log('=== API Format Data ===')
      // console.log(JSON.stringify(apiFormatData, null, 2))

      const healthData = {
        age,
        gender,
        bmi,
        currentWeight,
        smokingStatus,
        smokingFrequency: formattedSmokingFrequency,
        alcoholConsumption,
        mealPreferences,
        mealFoodList,
        apiData: apiFormatData
      }

      onHealthDataSubmit?.(healthData)
      setOpen(false)
      navigate('/my-health')
      setTimeout(() => reset(), 150)
    } else {
      handleNext()
    }
  }

  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users, color: 'text-blue-600' },
    { label: 'Health Goals Achieved', value: '12K+', icon: Target, color: 'text-green-600' },
    { label: 'Average Improvement', value: '85%', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Expert Certified', value: '98%', icon: Award, color: 'text-orange-600' }
  ]

  const features = [
    {
      icon: Activity,
      title: 'Lifestyle Impact Analysis',
      description: 'Discover the effect of your current habits, such as smoking and alcohol consumption, on your overall health.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Heart,
      title: 'Nutritional Gaps',
      description: 'Get personalized nutrition recommendations and wellness tips for a balanced lifestyle.',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: Target,
      title: 'Personalized Reports',
      description: 'Set and achieve your fitness and wellness goals with customized plans and progress tracking.',
      color: 'bg-green-50 text-green-600'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Fitness Enthusiast',
      content: 'AUVida transformed my approach to wellness. The personalized fitness recommendations are spot-on!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Working Professional',
      content: 'Finally found a platform that understands my busy lifestyle and provides practical wellness tips.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Wellness Coach',
      content: 'I recommend AUVida to all my clients. The comprehensive lifestyle approach is excellent.',
      rating: 5
    }
  ]

  useEffect(() => {
    if (open) {
      const fetchFoods = async () => {
        try {
          const response = await fetch('https://i5r58exmh9.execute-api.ap-southeast-2.amazonaws.com/prod/searchFoodIntake', {
            method: 'POST', // ✅ must be POST
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'kQtOrJu6Ba9TExHVFhVAt6aI7VOwMC3pabxQMR1y'
            },
            body: JSON.stringify({}) // ✅ explicitly empty body
          })

          const data = await response.json()
          // Lambda behind API Gateway often wraps result in { body: "string" }
          const foods = typeof data.body === 'string' ? JSON.parse(data.body) : data
          setAllFoods(foods)
        } catch (error) {
          console.error('Error fetching food list:', error)
        }
      }

      fetchFoods()
    }
  }, [open])

  // Updated useEffect for click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if clicked outside any food suggestion dropdown
      Object.keys(foodSuggestions).forEach((suggestionKey) => {
        if (foodSuggestions[suggestionKey]?.length > 0) {
          // Find the input container for this specific suggestion key
          const inputContainer = document.querySelector(`[data-suggestion-key="${suggestionKey}"]`)
          if (inputContainer && !inputContainer.contains(event.target)) {
            // Clear suggestions for this specific input if clicked outside
            setFoodSuggestions((prev) => ({ ...prev, [suggestionKey]: [] }))
          }
        }
      })
    }

    if (open) {
      // Only add event listener when modal is open
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      // Clean up event listener
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [foodSuggestions, open])

  return (
    <div className="min-h-screen bg-transparent">
      {/* HERO Section */}
      <section className="relative isolate overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div
            className="absolute top-32 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute bottom-10 right-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
            style={{ animationDelay: '4s' }}
          ></div>
        </div>

        {/* Decorative elements */}
        <div
          className="pointer-events-none absolute -z-10 right-0 top-0 h-[520px] w-[520px] rounded-bl-[220px] bg-gradient-to-br from-green-100 to-green-200"
          style={{ clipPath: 'ellipse(70% 60% at 80% 0%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-3 gap-10 items-center">
            {/* Left: headline */}
            <div className={`lg:col-span-1 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-[28px] sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-gray-900" style={{ fontSize: '46px' }}>
                Guarding Your <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Health</span> Like Gold
                {/* <br /> is an Asset */}
              </h1>

              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Turn Your Daily Habits into Actionable Health Insights — Compare, Improve, Thrive.
                {/* <br /><span className="font-medium text-green-600"> We value your Health as the weight of Gold.</span> */}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setOpen(true)}
                  className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                >
                  Start Health Assessment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right: illustration */}
            <div className={`relative lg:col-span-2 transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="aspect-[4/3] w-full rounded-[32px] bg-gradient-to-br from-green-100 to-blue-100 border border-green-200 shadow-2xl overflow-hidden">
                  <img
                    src="/background.gif"
                    alt="People running illustration"
                    className="w-full h-full object-cover rounded-[32px] hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 animate-bounce" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Heart Rate</p>
                      <p className="text-xs text-gray-500">72 BPM</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 animate-bounce" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Steps Today</p>
                      <p className="text-xs text-gray-500">8,432</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-transparent border-t border-gray-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/20 hover:bg-white/90 hover:shadow-xl transition-all duration-500 delay-${
                  index * 100
                }`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 ${stat.color} mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore More <span className="text-green-600">Features</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover additional tools and insights to support your wellness journey</p>
          </div>

          <div className="space-y-12">
            {/* Recipes Row - Modern Clean Style */}
            <div className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-700 cursor-pointer">
              <Link
                to="/recipes"
                className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-700 cursor-pointer block"
              >
                <div className="grid md:grid-cols-2 items-center">
                  {/* Image Section */}
                  <div className="relative overflow-hidden h-80 md:h-96">
                    <img
                      src="/recipe.webp"
                      alt="Healthy recipes"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-3xl">🥗</span>
                        </div>
                        <p className="font-medium text-lg">Recipe Collection</p>
                      </div>
                    </div>
                    {/* Floating tag */}
                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 shadow-lg">
                      New Recipes Added Weekly
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 md:p-12 relative">
                    <div className="absolute top-6 right-6 opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                      <ArrowRight className="w-6 h-6 text-gray-600" />
                    </div>

                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Nutrition Hub</span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 group-hover:text-green-600 transition-colors">Discover Healthy Recipes</h3>

                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      Explore curated recipes designed by nutrition experts. From quick breakfast bowls to satisfying dinner options, find meals that fuel your wellness journey.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                        <span>500+ healthy recipes with nutritional info</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                        <span>Filter by dietary preferences & allergies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Regional Analytics Row - Gradient Style */}
            {/* <div className="group bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 cursor-pointer">
              <Link
                to="/regional-health-analytics"
                className="group bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 cursor-pointer block"
              >
                <div className="grid md:grid-cols-2 items-center">
                 
                  <div className="p-8 md:p-12 text-white relative order-2 md:order-1">
                    <div className="absolute top-6 right-6 opacity-80 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>

                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-white text-green-700 text-sm font-medium rounded-full shadow-lg">Data Insights</span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-emerald-300 transition-colors">Regional Health Analytics</h3>

                    <p className="text-green-100 mb-8 text-lg leading-relaxed">
                      Discover wellness patterns and health trends in your area. Compare local data, find community resources, and understand regional health insights.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">85%</div>
                        <div className="text-xs text-green-100">Active Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">12K</div>
                        <div className="text-xs text-green-100">Data Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">50+</div>
                        <div className="text-xs text-green-100">Regions</div>
                      </div>
                    </div>
                  </div>


                  <div className="relative overflow-hidden h-80 md:h-96 order-1 md:order-2">
                    <img
                      src="/regional_pic.gif"
                      alt="Health analytics dashboard"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-indigo-500 to-purple-600 flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-3xl">📊</span>
                        </div>
                        <p className="font-medium text-lg">Analytics Dashboard</p>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-700 shadow-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Live Data Updates
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for a <span className="text-green-600">healthier life</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with expert guidance to deliver personalized health solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group p-8 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 delay-${index * 100}`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-20 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What our users say</h2>
          <p className="text-lg text-gray-600 mb-12">Join thousands who have transformed their health journey with AUVida</p>

          <div className="relative h-48">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`absolute inset-0 transition-all duration-500 ${index === currentTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 mb-6">"{testimonial.content}"</blockquote>
                  <div>
                    <cite className="font-semibold text-gray-900">{testimonial.name}</cite>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentTestimonial ? 'bg-green-600 w-8' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to start your wellness journey?</h2>
          <p className="text-xl text-green-100 mb-8">Take our free wellness assessment and get personalized lifestyle recommendations in minutes.</p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-green-600 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200"
          >
            Start Your Assessment Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Modal: Health Assessment */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md">
            <div className="relative z-10 w-full max-w-md overflow-y-auto max-h-[80vh]">
              <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Health Assessment</h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                    aria-label="Close modal"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mx-auto mb-6 grid h-10 w-10 place-items-center rounded-full bg-green-50 text-green-600">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                <div className="space-y-4">
                  {step === 0 && (
                    <label className="block">
                      <span className="block text-sm font-medium text-gray-700">Age</span>
                      <input
                        type="number"
                        min={1}
                        max={75}
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value || '0', 10))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (canNext) handleNext()
                          }
                        }}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="e.g. 23"
                        required
                      />
                    </label>
                  )}

                  {step === 1 && (
                    <label className="block">
                      <span className="block text-sm font-medium text-gray-700">Gender</span>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </label>
                  )}

                  {step === 2 && (
                    <label className="block">
                      <span className="block text-sm font-medium text-gray-700">BMI (Body Mass Index)</span>
                      <input
                        type="number"
                        min={15}
                        max={50}
                        step={0.1}
                        value={bmi}
                        onChange={(e) => setBmi(parseFloat(e.target.value || '0'))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (canNext) handleNext()
                          }
                        }}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="e.g. 23.9"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Normal range: 18.5-24.9 | If unknown, use an online BMI calculator</p>
                    </label>
                  )}

                  {step === 3 && (
                    <label className="block">
                      <span className="block text-sm font-medium text-gray-700">Current Weight (kg)</span>
                      <input
                        type="number"
                        min={30}
                        max={200}
                        step={0.5}
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(parseFloat(e.target.value || '0'))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (canNext) handleNext()
                          }
                        }}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="e.g. 75"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Enter your current weight in kilograms</p>
                    </label>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      {/* Smoking Status */}
                      <div>
                        <label className="block">
                          <span className="block text-sm font-medium text-gray-700 mb-2">Smoke or Vape</span>
                          <select
                            value={smokingStatus}
                            onChange={(e) => setSmokingStatus(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500"
                          >
                            <option value="Never Smoked">Never Smoked</option>
                            <option value="Ex-Smoker">Ex-Smoker</option>
                            <option value="Current Smoker">Current Smoker</option>
                          </select>
                        </label>

                        {/* Show frequency if current smoker */}
                        {smokingStatus === 'Current Smoker' && (
                          <div className="mt-3">
                            <span className="block text-sm font-medium text-gray-700 mb-2">Smoking Frequency</span>
                            <select
                              value={smokingFrequency}
                              onChange={(e) => setSmokingFrequency(e.target.value)}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500"
                            >
                              <option value="1-2 days">1-2 days per week</option>
                              <option value="3-6 days">3-6 days per week</option>
                              <option value="Daily">Daily</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Alcohol Consumption */}
                      <div>
                        <label className="block">
                          <span className="block text-sm font-medium text-gray-700 mb-2">Alcohol Consumption (standard drinks per week)</span>
                          <input
                            type="number"
                            min={0}
                            max={14}
                            value={alcoholConsumption}
                            onChange={(e) => setAlcoholConsumption(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500"
                            placeholder="Enter 0-14"
                          />
                          <p className="mt-1 text-xs text-gray-500">Australian standard drink = 10g alcohol (285ml beer, 100ml wine, 30ml spirits)</p>
                        </label>
                      </div>
                    </div>
                  )}
                  {step === 5 && (
                    <div className="space-y-6">
                      {/* Meal Preferences */}
                      <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Primary Meal Times (select all that apply)</span>
                        <div className="space-y-2">
                          {['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Evening Snacks'].map((meal) => (
                            <div key={meal}>
                              {/* Meal time checkbox */}
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={mealPreferences.includes(meal)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setMealPreferences([...mealPreferences, meal])
                                    } else {
                                      setMealPreferences(mealPreferences.filter((m) => m !== meal))
                                    }
                                  }}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{meal}</span>
                              </label>

                              {/* If this meal is selected, show the input and add food button */}
                              {mealPreferences.includes(meal) && (
                                <div className="mt-2">
                                  {/* Dynamic input for food */}
                                  {mealFoodList[meal].map((food, index) => {
                                    // Create unique suggestion key for each input
                                    const suggestionKey = `${meal}-${index}`

                                    return (
                                      <div key={index} className="flex items-center space-x-2 mb-2">
                                        {/* Use unique suggestion key for each input */}
                                        <div className="relative w-1/2" data-suggestion-key={suggestionKey}>
                                          <input
                                            type="text"
                                            value={food?.name || ''} // Handle both string and object cases
                                            placeholder={`Enter food for ${meal}`}
                                            className="p-1 border border-gray-300 rounded-md text-sm w-full"
                                            onChange={(e) => {
                                              const value = e.target.value
                                              // Keep your original handleFoodChange logic
                                              handleFoodChange(meal, index, { ...food, name: value })

                                              if (value.length > 1) {
                                                const results = allFoods.filter((f) => f.food_name.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
                                                // Use unique suggestion key instead of meal
                                                setFoodSuggestions((prev) => ({ ...prev, [suggestionKey]: results }))
                                              } else {
                                                // Clear suggestions for this specific input
                                                setFoodSuggestions((prev) => ({ ...prev, [suggestionKey]: [] }))
                                              }
                                            }}
                                          />

                                          {/* Food suggestions dropdown - use unique suggestion key */}
                                          {foodSuggestions[suggestionKey]?.length > 0 && (
                                            <ul className="absolute bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-40 overflow-y-auto text-sm z-50 w-full">
                                              {foodSuggestions[suggestionKey].map((f) => (
                                                <li
                                                  key={f.public_food_key}
                                                  onClick={() => {
                                                    // Keep your original click handling logic
                                                    handleFoodChange(meal, index, {
                                                      id: f.public_food_key,
                                                      name: f.food_name,
                                                      quantity: food.quantity
                                                    })
                                                    // Clear suggestions for this specific input
                                                    setFoodSuggestions((prev) => ({ ...prev, [suggestionKey]: [] }))
                                                  }}
                                                  className="px-2 py-1 cursor-pointer hover:bg-green-100"
                                                >
                                                  {f.food_name}
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>

                                        <input
                                          type="number"
                                          min="1"
                                          placeholder="g"
                                          className="w-20 p-1 border border-gray-300 rounded-md text-sm"
                                          value={food.quantity || ''} // Handle both string and object cases
                                          onChange={(e) => handleFoodChange(meal, index, { ...food, quantity: e.target.value })}
                                          required
                                        />

                                        {mealFoodList[meal].length > 1 && (
                                          <button type="button" onClick={() => handleRemoveFood(meal, index)} className="text-xl text-gray-600">
                                            ➖
                                          </button>
                                        )}
                                        {index === mealFoodList[meal].length - 1 && (
                                          <button type="button" onClick={() => handleAddFood(meal)} className="text-xl text-gray-600">
                                            ➕
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={`h-2 w-2 rounded-full ${i === step ? 'bg-green-600' : 'bg-gray-300'}`} />
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => (step === 0 ? handleClose() : setStep((s) => Math.max(0, s - 1)))}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {step === 0 ? 'Cancel' : '< Back'}
                  </button>

                  <button
                    type="submit"
                    disabled={!canNext}
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {step === 5 ? 'Submit' : 'Next'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
