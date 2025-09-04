import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from './logo.png'

const Navigation: React.FC = () => {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      label: 'Home',
      // icon: (
      //   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      //     <path
      //       strokeLinecap="round"
      //       strokeLinejoin="round"
      //       strokeWidth={1.5}
      //       d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      //     />
      //   </svg>
      // )
    },
    {
      path: '/my-health',
      label: 'My Health',
      // icon: (
      //   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      //     <path
      //       strokeLinecap="round"
      //       strokeLinejoin="round"
      //       strokeWidth={1.5}
      //       d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      //     />
      //   </svg>
      // )
    },

    // {
    //   path: '/meal-plan',
    //   label: 'Meal Plan',
    //   // icon: (
    //   //   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //   //     <path
    //   //       strokeLinecap="round"
    //   //       strokeLinejoin="round"
    //   //       strokeWidth={1.5}
    //   //       d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    //   //     />
    //   //   </svg>
    //   // )
    // },
    // {
    //   path: '/recipes',
    //   label: 'Recipes',
    //   // icon: (
    //   //   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //   //     <path
    //   //       strokeLinecap="round"
    //   //       strokeLinejoin="round"
    //   //       strokeWidth={1.5}
    //   //       d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    //   //     />
    //   //   </svg>
    //   // )
    // },
    // {
    //   path: '/regional-health-analytics',
    //   label: 'Regional Health Analytics',
    //   // icon: (
    //   //   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //   //     <path
    //   //       strokeLinecap="round"
    //   //       strokeLinejoin="round"
    //   //       strokeWidth={1.5}
    //   //       d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    //   //     />
    //   //   </svg>
    //   // )
    // },

    // {
    //   path: '/news',
    //   label: 'News',
    //   // icon: (
    //   //   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //   //     <path
    //   //       strokeLinecap="round"
    //   //       strokeLinejoin="round"
    //   //       strokeWidth={1.5}
    //   //       d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    //   //     />
    //   //   </svg>
    //   // )
    // }
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 ">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img src={logo} alt="AUVida Logo" className="w-15 h-15 object-contain" />
              <span className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors">AUVida</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-green-50 text-green-600 border border-green-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
              >
                {/* <div className={`p-1 rounded ${location.pathname === item.path ? 'text-green-600' : 'text-gray-500'}`}>{item.icon}</div> */}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
