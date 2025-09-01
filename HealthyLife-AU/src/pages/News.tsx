import React, { useState } from 'react'
import { Clock, User, Eye, Bookmark, Share2, Filter, Search, TrendingUp, Calendar, Tag, ChevronRight, Play, Download } from 'lucide-react'

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All News', count: 127 },
    { id: 'diabetes', name: 'Diabetes', count: 23 },
    { id: 'mental-health', name: 'Mental Health', count: 18 },
    { id: 'nutrition', name: 'Diet & Nutrition', count: 31 },
    { id: 'fitness', name: 'Fitness', count: 15 },
    { id: 'research', name: 'Medical Research', count: 22 },
    { id: 'policy', name: 'Health Policy', count: 18 }
  ]

  const featuredNews = [
    {
      id: 1,
      title: 'Australian Diabetes Trends Report',
      excerpt: 'Latest data shows that through lifestyle interventions, 60% of pre-diabetic patients can prevent developing type 2 diabetes.',
      image: '/api/placeholder/400/250',
      category: 'Research',
      readTime: '5 min read',
      publishedAt: '2 days ago',
      author: 'Australian Institute of Health and Welfare',
      views: 1240,
      trending: true
    },
    {
      id: 2,
      title: 'New Mental Health Support Program',
      excerpt: 'Victorian Government launches new mental health support program, providing more accessible mental health services for residents.',
      image: '/api/placeholder/400/250',
      category: 'Policy',
      readTime: '3 min read',
      publishedAt: '1 week ago',
      author: 'Victoria Department of Health',
      views: 890,
      trending: true
    },
    {
      id: 3,
      title: 'Mediterranean Diet Research',
      excerpt: 'Long-term adherence to Mediterranean diet patterns reduces cardiovascular disease risk by 30% and cognitive decline risk by 13%.',
      image: '/api/placeholder/400/250',
      category: 'Nutrition',
      readTime: '4 min read',
      publishedAt: '3 days ago',
      author: 'Nutrition Journal',
      views: 756,
      trending: true
    }
  ]

  const latestNews = [
    {
      id: 4,
      title: 'Children to be offered chickenpox vaccine on NHS',
      excerpt: 'All young children in Australia will be offered a free chickenpox vaccine from January 2026.',
      category: 'Policy',
      publishedAt: '4 hours ago',
      author: 'Health Department',
      readTime: '2 min',
      views: 234
    },
    {
      id: 5,
      title: 'First human case of flesh-eating screwworm parasite confirmed',
      excerpt: 'Medical authorities report first documented case in decades, raising awareness for tropical disease prevention.',
      category: 'Research',
      publishedAt: '6 hours ago',
      author: 'Medical Journal',
      readTime: '3 min',
      views: 445
    },
    {
      id: 6,
      title: "Pine nuts and goat's milk should get allergy labels, say experts",
      excerpt: 'Food safety experts recommend expanded allergen labeling for commonly overlooked allergenic foods.',
      category: 'Policy',
      publishedAt: '8 hours ago',
      author: 'Food Standards Australia',
      readTime: '2 min',
      views: 123
    },
    {
      id: 7,
      title: 'Brain study could help treat phantom limb pain',
      excerpt: 'Breakthrough neuroscience research offers new treatment possibilities for amputees experiencing chronic pain.',
      category: 'Research',
      publishedAt: '12 hours ago',
      author: 'Neuroscience Institute',
      readTime: '5 min',
      views: 567
    },
    {
      id: 8,
      title: 'Government turns to TikTokers to advise on cosmetic surgery',
      excerpt: 'Health authorities partner with social media influencers to promote safer cosmetic surgery practices.',
      category: 'Policy',
      publishedAt: '1 day ago',
      author: 'Health Communications',
      readTime: '3 min',
      views: 789
    }
  ]

  const healthPrograms = [
    {
      id: 1,
      title: 'All In The Mind',
      description: 'Mental health podcast exploring psychology and wellbeing',
      color: 'bg-teal-500',
      type: 'podcast'
    },
    {
      id: 2,
      title: 'Health Report',
      description: 'Weekly medical research and health policy updates',
      color: 'bg-pink-500',
      type: 'podcast'
    },
    {
      id: 3,
      title: "What's That Rash?",
      description: 'Common health conditions explained by medical experts',
      color: 'bg-orange-500',
      type: 'podcast'
    },
    {
      id: 4,
      title: 'Body Sphere',
      description: 'Exploring the science of human health and medicine',
      color: 'bg-purple-500',
      type: 'podcast'
    }
  ]

  const filteredNews = [...featuredNews, ...latestNews].filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category.toLowerCase().includes(selectedCategory)
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryColor = (category) => {
    const colors = {
      Research: 'bg-blue-100 text-blue-800',
      Policy: 'bg-green-100 text-green-800',
      Nutrition: 'bg-orange-100 text-orange-800',
      'Mental Health': 'bg-purple-100 text-purple-800',
      Fitness: 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health News & Insights</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest health research, policy updates, and medical breakthroughs from Australia and around the world
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search health news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap font-medium transition-all ${
                    selectedCategory === category.id ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured News */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Stories</h2>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Trending Now</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredNews.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-full ${getCategoryColor(article.category).split(' ')[0]} flex items-center justify-center`}>
                      <Tag className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {article.trending && <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">TRENDING</div>}

                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>{article.category}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">{article.title}</h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                      </div>
                    </div>
                    <span>{article.publishedAt}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{article.author}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bookmark className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Latest News */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Latest Health News</h3>

              <div className="space-y-6">
                {latestNews.map((article, index) => (
                  <div key={article.id} className={`flex gap-4 pb-6 ${index !== latestNews.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-8 h-8 text-gray-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>{article.category}</span>
                        <span className="text-xs text-gray-500">{article.publishedAt}</span>
                      </div>

                      <h4 className="font-bold text-gray-900 mb-2 hover:text-green-600 cursor-pointer transition-colors">{article.title}</h4>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span>{article.author}</span>
                          <span>{article.readTime}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views}</span>
                          </div>
                        </div>

                        <button className="text-green-600 hover:text-green-700 flex items-center gap-1">
                          <span>Read more</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">Load More Articles</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Health Programs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Health Programs</h3>

              <div className="space-y-4">
                {healthPrograms.map((program) => (
                  <div key={program.id} className="group cursor-pointer">
                    <div className={`${program.color} rounded-xl p-4 text-white mb-3 group-hover:scale-105 transition-transform`}>
                      <div className="flex items-center justify-between">
                        <Play className="w-8 h-8" />
                        <span className="text-sm font-medium">Listen to the podcast</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{program.title}</h4>
                    <p className="text-sm text-gray-600">{program.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Health in your Inbox</h3>
              <p className="text-green-100 mb-4">Get the latest health news, research updates, and wellness tips delivered weekly.</p>

              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50"
                />
                <button className="w-full bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Subscribe Now</button>
              </div>

              <p className="text-xs text-green-100 mt-3">Unsubscribe anytime. Privacy policy applies.</p>
            </div>

            {/* Trending Topics */}
            {/* <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Trending Topics</h3>
              
              <div className="space-y-3">
                {[
                  'Mental Health Crisis',
                  'Diabetes Prevention',
                  'Heart Disease Research',
                  'COVID-19 Updates',
                  'Vaccine Information',
                  'Healthy Aging',
                  'Women\'s Health',
                  'Indigenous Health'
                ].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <span className="font-medium text-gray-700">{topic}</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default News
