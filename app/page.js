'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [franchises, setFranchises] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [currentUser, setCurrentUser] = useState(null)

  const categories = ['ทั้งหมด', 'อาหาร', 'เครื่องดื่ม', 'บริการ', 'ค้าปลีก', 'การศึกษา', 'สุขภาพและความงาม']

  useEffect(() => {
    fetchFranchises()
    checkUser()
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      fetchFranchises()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchFranchises = async () => {
    try {
      setLoading(true)
      
      // Simple query without JOIN to avoid SQL errors
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('is_boosted', { ascending: false })  // Boosted posts first
        .order('is_featured', { ascending: false })  // Featured posts second
        .order('created_at', { ascending: false })   // Then by newest

      if (error) throw error

      console.log('ดึงข้อมูลได้:', data?.length, 'รายการ')

      // Format data with basic information
      const formattedData = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        investment: `${item.investment_min.toLocaleString()} - ${item.investment_max.toLocaleString()}`,
        investmentMin: item.investment_min,
        investmentMax: item.investment_max,
        description: item.description,
        contact: item.contact || item.line_id,
        features: item.features || [],
        imageUrl: item.image_url,
        icon: getCategoryIcon(item.category),
        location: item.location,
        createdAt: item.created_at,
        views: item.views || 0,
        // Premium features from franchise table
        isBoosted: item.is_boosted || false,
        isFeatured: item.is_featured || false,
        boostEndDate: item.boost_end_date,
        // For demo, randomly assign premium status
        isPremiumSeller: Math.random() > 0.7, // 30% chance of being premium
        userPlanType: Math.random() > 0.7 ? 'premium' : 'basic'
      }))

      setFranchises(formattedData)
    } catch (error) {
      console.error('Error fetching franchises:', error)
    } finally {
      setLoading(false)
    }
  }

  // Remove the fetchFranchisesSimple function since we're not using it anymore

  const getCategoryIcon = (category) => {
    const icons = {
      'อาหาร': '🍜',
      'เครื่องดื่ม': '🧋',
      'บริการ': '💼',
      'ค้าปลีก': '🛍️',
      'การศึกษา': '📚',
      'สุขภาพและความงาม': '💊'
    }
    return icons[category] || '🏪'
  }

  const filteredFranchises = franchises.filter(franchise => {
    const matchSearch = franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       franchise.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === 'ทั้งหมด' || franchise.category === selectedCategory
    return matchSearch && matchCategory
  })

  const getPremiumBadge = (franchise) => {
    if (franchise.isBoosted) {
      return (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          🚀 BOOSTED
        </div>
      )
    }
    if (franchise.isPremiumSeller) {
      return (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ PREMIUM
        </div>
      )
    }
    return null
  }

  const getCardStyle = (franchise) => {
    if (franchise.isBoosted) {
      return "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
    }
    if (franchise.isPremiumSeller) {
      return "bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
    }
    return "bg-white shadow-md hover:shadow-lg"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
            onClick={() => router.push('/')}
          >
            🏪 FranchiseHub
          </h1>
          
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {currentUser.email}
                </span>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => router.push('/add-franchise')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + ลงประกาศ
                </button>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setCurrentUser(null)
                  }}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => router.push('/auth')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button 
                  onClick={() => router.push('/add-franchise')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + ลงประกาศฟรี
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            ค้นหาแฟรนไชส์ในฝัน เริ่มธุรกิจของคุณวันนี้
          </h2>
          <p className="text-xl mb-8">
            แพลตฟอร์มซื้อขายแฟรนไชส์อันดับ 1 ของประเทศไทย
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาแฟรนไชส์... (เช่น ชาไข่มุก, กาแฟ, ร้านอาหาร)"
                className="w-full px-6 py-4 pl-12 rounded-lg text-gray-800 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Premium Features Banner */}
          <div className="mt-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                🚀 <strong>Boosted</strong> - แสดงบนสุด
              </span>
              <span className="flex items-center gap-1">
                ⭐ <strong>Premium</strong> - ผู้ขายที่ไว้วางใจ
              </span>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                อัปเกรดเลย
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">หมวดหมู่:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              พบ {filteredFranchises.length} รายการ
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>🚀 = Boosted</span>
              <span>⭐ = Premium</span>
            </div>
          </div>
        )}

        {/* Franchise Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFranchises.map(franchise => (
              <div 
                key={franchise.id} 
                className={`rounded-lg transition-all duration-300 relative ${getCardStyle(franchise)}`}
              >
                {/* Premium Badge */}
                {getPremiumBadge(franchise)}

                {/* Franchise Image */}
                <div 
                  className="h-48 bg-gray-100 rounded-t-lg overflow-hidden cursor-pointer relative"
                  onClick={() => router.push(`/franchise/${franchise.id}`)}
                >
                  {franchise.imageUrl ? (
                    <img 
                      src={franchise.imageUrl} 
                      alt={franchise.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="60" text-anchor="middle" x="100" y="115">${franchise.icon}</text></svg>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100 hover:bg-gray-200 transition-colors">
                      {franchise.icon}
                    </div>
                  )}

                  {/* Boost Timer */}
                  {franchise.isBoosted && franchise.boostEndDate && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      🔥 Boosted
                    </div>
                  )}
                </div>
                
                {/* Franchise Details */}
                <div className="p-6">
                  {/* Title */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors flex-1"
                      onClick={() => router.push(`/franchise/${franchise.id}`)}
                    >
                      {franchise.name}
                    </h3>
                    {franchise.isPremiumSeller && (
                      <div className="ml-2 text-blue-600 text-sm">
                        ⭐
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                    {franchise.icon} {franchise.category}
                  </p>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">{franchise.description}</p>
                  
                  {/* Location */}
                  {franchise.location && (
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                      📍 {franchise.location}
                    </p>
                  )}
                  
                  {/* Features */}
                  {franchise.features.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {franchise.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {franchise.features.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{franchise.features.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Investment & Views */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-green-600 font-semibold">
                      <span className="mr-2">💰</span>
                      <span>{franchise.investment} บาท</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <span className="mr-1">👀</span>
                      <span>{franchise.views}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/franchise/${franchise.id}`)}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors font-medium ${
                        franchise.isBoosted 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                          : franchise.isPremiumSeller
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {franchise.isBoosted ? '🚀 ดูรายละเอียด' : 'ดูรายละเอียด'}
                    </button>
                    
                    {franchise.contact && (
                      <a 
                        href={`tel:${franchise.contact}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm text-center transition-colors"
                      >
                        📞 ติดต่อ
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredFranchises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">ไม่พบแฟรนไชส์ที่ค้นหา</p>
            <p className="text-gray-400 mt-2">ลองค้นหาคำอื่น หรือเปลี่ยนหมวดหมู่</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 FranHub - ตลาดซื้อขายแฟรนไชส์อันดับ 1</p>
        </div>
      </footer>
    </div>
  )
}