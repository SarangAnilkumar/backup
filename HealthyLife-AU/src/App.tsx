import React from 'react'
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
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulator" element={<LifestyleSimulator />} />
            <Route path="/my-health" element={<MyHealth />} />
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
