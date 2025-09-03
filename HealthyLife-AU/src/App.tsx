import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/common/Navigation'
import Dashboard from './pages/Dashboard'
import LifestyleSimulator from './pages/News'
import Footer from './components/common/Footer'
import MyHealth from './pages/MyHealth'
import Recipes from './pages/Recipes'
import MealPlan from './pages/MealPlan'
import RegionalHealthAnalytics from './pages/RegionalHealthAnalytics'
import News from './pages/News'

function App() {
  const [userHealthData, setUserHealthData] = useState({
    bmi: null,
    currentWeight: null,
    age: null,
    gender: null,
    smokingStatus: null,
    smokingFrequency: null,
    alcoholConsumption: null,
    mealPreferences: []
  })

  const handleHealthDataSubmit = (healthData) => {
    setUserHealthData(healthData)
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard onHealthDataSubmit={handleHealthDataSubmit} />} />
            <Route path="/simulator" element={<LifestyleSimulator />} />
            <Route path="/my-health" element={<MyHealth healthData={userHealthData} />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/regional-health-analytics" element={<RegionalHealthAnalytics />} />
            <Route path="/news" element={<News />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
