import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/common/Navigation'
import Dashboard from './pages/Dashboard'
import LifestyleSimulator from './pages/LifestyleSimulator'
import Footer from './components/common/Footer'
import MyHealth from './pages/MyHealth'
import Recipes from './pages/Recipes'
import MealPlan from './pages/MealPlan'

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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
