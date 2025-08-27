import React, { useState } from 'react'
import { Clock, TrendingUp, Target, Calendar, ChefHat, Heart, Zap } from 'lucide-react'

const MealPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState('balanced')
  const [selectedDay, setSelectedDay] = useState('today')

  const mealPlans = [
    {
      id: 'chefs-choice',
      title: "Chef's Choice",
      subtitle: 'Our most-loved, chef-designed meals made to make eating healthy delicious.',
      color: 'bg-gradient-to-br from-orange-100 to-yellow-100',
      icon: <ChefHat className="w-8 h-8 text-orange-600" />
    },
    {
      id: 'balanced',
      title: 'Healthy Balance',
      subtitle: 'Balanced meals for everyday health, diabetes & GLP-1.',
      color: 'bg-gradient-to-br from-green-100 to-emerald-100',
      icon: <Target className="w-8 h-8 text-green-600" />
    },
    {
      id: 'protein',
      title: 'Protein Plus',
      subtitle: 'Bigger Meals. More protein. Designed to fuel your day.',
      color: 'bg-gradient-to-br from-red-100 to-pink-100',
      icon: <Zap className="w-8 h-8 text-red-600" />
    },
    {
      id: 'calorie-smart',
      title: 'Calorie Smart',
      subtitle: 'Light and balanced meals with less than 400 calories to support weightloss goals.',
      color: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />
    }
  ]

  const todayMeals = [
    { type: 'Breakfast', calories: 350, items: ['Oats with berries', 'Greek yogurt'] },
    { type: 'Lunch', calories: 420, items: ['Grilled chicken salad', 'Quinoa'] },
    { type: 'Dinner', calories: 480, items: ['Salmon with vegetables', 'Brown rice'] },
    { type: 'Snack', calories: 150, items: ['Mixed nuts', 'Apple slices'] }
  ]

  const weeklyMeals = [
    {
      id: 1,
      title: 'Mediterranean Grilled Chicken',
      description: 'with Herb-roasted Potatoes & Green Beans',
      image: '/api/placeholder/300/200',
      calories: 485,
      protein: 42,
      time: '35 min',
      badge: 'NEW',
      badgeColor: 'bg-orange-500'
    },
    {
      id: 2,
      title: 'Beef & Mushroom Risotto',
      description: 'with Parmesan & Fresh Herbs',
      image: '/api/placeholder/300/200',
      calories: 520,
      protein: 38,
      time: '40 min',
      badge: 'POPULAR',
      badgeColor: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Teriyaki Salmon Bowl',
      description: 'with Rice & Asian Vegetables',
      image: '/api/placeholder/300/200',
      calories: 445,
      protein: 35,
      time: '25 min',
      badge: 'HIGH PROTEIN',
      badgeColor: 'bg-blue-500'
    }
  ]

  const nutritionData = [
    { name: 'Vitamin A', current: 850, recommended: 900, unit: 'μg', status: 'good' },
    { name: 'Vitamin C', current: 75, recommended: 90, unit: 'mg', status: 'low' },
    { name: 'Vitamin D', current: 15, recommended: 20, unit: 'μg', status: 'low' },
    { name: 'Vitamin B12', current: 2.8, recommended: 2.4, unit: 'μg', status: 'good' },
    { name: 'Iron', current: 12, recommended: 18, unit: 'mg', status: 'low' },
    { name: 'Calcium', current: 950, recommended: 1000, unit: 'mg', status: 'good' }
  ]

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Heart className="inline w-8 h-8 text-green-600 mr-3" />
            Smart Meal Planner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Plan your daily meals and get complete nutritional analysis and recommendations</p>
        </div>

        {/* Meal Plan Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Meal Plan</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mealPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`${plan.color} rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 ${selectedPlan === plan.id ? 'ring-2 ring-green-500 shadow-lg' : ''}`}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4">{plan.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-sm text-gray-700 flex-1">{plan.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Meal Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Today's Meal Summary</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {todayMeals.map((meal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">{meal.type}</h4>
                      <p className="text-sm text-gray-600">{meal.items.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{meal.calories} calories</p>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">View Details</button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-green-600">{todayMeals.reduce((sum, meal) => sum + meal.calories, 0)} calories</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">View complete nutritional breakdown</p>
                </div>
              </div>
            </div>

            {/* This Week's Recommended Meals */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">This Week's Recommended Meals</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {weeklyMeals.map((meal) => (
                  <div key={meal.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-green-600 opacity-50" />
                      <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold text-white rounded ${meal.badgeColor}`}>{meal.badge}</span>
                    </div>

                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{meal.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{meal.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{meal.time}</span>
                          </div>
                          <span>{meal.calories} cal</span>
                          <span>{meal.protein}g protein</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vitamin & Nutrition Analysis */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vitamin Intake Analysis</h3>

              <div className="space-y-4">
                {nutritionData.map((nutrient, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{nutrient.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${nutrient.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {nutrient.current}/{nutrient.recommended} {nutrient.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${nutrient.status === 'good' ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{
                          width: `${Math.min((nutrient.current / nutrient.recommended) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Add citrus fruits for Vitamin C</li>
                  <li>• Include leafy greens for Iron</li>
                  <li>• Consider fortified foods for Vitamin D</li>
                </ul>
              </div>

              <button className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">Get Personalized Plan</button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Health Journey?</h3>
            <p className="text-lg mb-6 opacity-90">Get personalized meal plans, nutrition tracking, and expert recommendations</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">Start Free Trial</button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-colors">View Full Menu</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MealPlan
