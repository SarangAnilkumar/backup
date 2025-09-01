import React, { useState } from 'react'
import { Heart, Clock, Users, ChefHat, Search } from 'lucide-react'

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const featuredRecipe = {
    id: 1,
    title: 'Mediterranean Grilled Chicken',
    description:
      'Tender and juicy Mediterranean-style Grilled Chicken. Marinated in a blend of aromatic herbs, this dish is served with creamy tzatziki sauce for an exquisite experience.',
    image: '/api/placeholder/600/400',
    cookTime: '35 mins',
    servings: 4,
    difficulty: 'Medium',
    tags: ['High Protein', 'Low Carb', 'Gluten Free']
  }

  const recipes = [
    {
      id: 2,
      title: 'Spicy Vermicelli Noodles Salad',
      description: 'Fresh and vibrant Vietnamese-style salad with herbs and tangy dressing',
      image: '/api/placeholder/300/200',
      cookTime: '20 mins',
      servings: 2,
      category: 'salad',
      tags: ['Vegetarian', 'Spicy', 'Fresh']
    },
    {
      id: 3,
      title: 'Classic Italian Beef Maltagliati',
      description: 'Traditional Italian pasta with tender beef and rich tomato sauce',
      image: '/api/placeholder/300/200',
      cookTime: '45 mins',
      servings: 4,
      category: 'main',
      tags: ['Italian', 'Pasta', 'Beef']
    },
    {
      id: 4,
      title: 'Sour & Spicy Korean Kimchi',
      description: 'Authentic fermented Korean kimchi with bold flavors',
      image: '/api/placeholder/300/200',
      cookTime: '15 mins',
      servings: 6,
      category: 'side',
      tags: ['Korean', 'Fermented', 'Spicy']
    }
  ]

  const categories = [
    { id: 'all', name: 'All Recipes' },
    { id: 'main', name: 'Main Dishes' },
    { id: 'salad', name: 'Salads' },
    { id: 'side', name: 'Sides' },
    { id: 'dessert', name: 'Desserts' }
  ]

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Delicious <span className="text-green-600">Recipes</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore our collection of healthy, nutritious recipes tailored for your dietary preferences and health goals.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedCategory === category.id ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Recipe */}
        <div className="mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-50 to-blue-50 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="w-6 h-6 text-green-600" />
                  <span className="text-green-600 font-semibold">Featured Recipe</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{featuredRecipe.title}</h2>
                <p className="text-gray-600 mb-6 text-lg">{featuredRecipe.description}</p>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5" />
                    <span>{featuredRecipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5" />
                    <span>{featuredRecipe.servings} servings</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredRecipe.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                  View Recipe
                </button>
              </div>

              <div className="relative">
                <div className="aspect-square w-full max-w-md mx-auto bg-gradient-to-br from-orange-100 to-green-100 rounded-3xl p-8 flex items-center justify-center">
                  <ChefHat className="w-32 h-32 text-green-600 opacity-50" />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-200 rounded-full opacity-60"></div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-200 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Popular <span className="text-green-600">Recipes</span> Today
            </h3>
            <span className="text-gray-500">
              {filteredRecipes.length} of {recipes.length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="group cursor-pointer">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-green-600 opacity-50" />
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{recipe.title}</h4>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{recipe.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cookTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-xl border-2 border-green-600 hover:bg-green-600 hover:text-white transition-colors">
            Load More Recipes
          </button>
        </div>
      </div>
    </div>
  )
}

export default Recipes
